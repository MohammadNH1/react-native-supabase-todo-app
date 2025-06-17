import { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Text
} from "react-native";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function EditProfileScreen() {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();
  useEffect(() => {
    const fetchData = async () => {
      try {
       if(!user) return

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user?.id)
          .single();

        if (error) throw error;

        setUsername(data.username || "");
        setFullName(data.full_name || "");
        setWebsite(data.website || "");
        setAvatarUrl(data.avatar_url || "");
      } catch (error: any) {
        Alert.alert("Error", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdate = async () => {
    if (!username || !fullName) {
      Alert.alert("Validation", "Username and Full Name are required.");
      return;
    }

    try {
      setLoading(true);
      const updates = {
        id: user?.id,
        username,
        full_name: fullName,
        website,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);
      if (error) return;

      router.replace("/(tabs)/profile");
    } catch (error: any) {
      Alert.alert("Update Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = () => {
    router.back();
  };
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Username *"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Full Name *"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Website"
        value={website}
        onChangeText={setWebsite}
      />
      <TextInput
        style={styles.input}
        placeholder="Avatar URL"
        value={avatarUrl}
        onChangeText={setAvatarUrl}
      />
      <Button
        title={loading ? "Updating..." : "Save"}
        onPress={handleUpdate}
        disabled={loading}
      />
      <TouchableOpacity style={styles.button} onPress={handleNavigate}>
     <Text style={styles.buttonText}>Back to profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, marginTop: 50 },
  input: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
