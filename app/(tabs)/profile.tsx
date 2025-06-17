import { useRouter } from "expo-router";
import { View, Text, Image, Button, StyleSheet, Alert } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not found");

      const { data, error } = await supabase
        .from("profiles")
        .select("username, full_name, website, avatar_url")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile({ ...data, email: user.email });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/welcome");
  };

  if (loading || !profile) return <Text style={styles.loading}>Loading...</Text>;

  return (
    <View style={styles.container}>
      {profile.avatar_url ? (
        <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder} />
      )}

      <Text style={styles.label}>Username:</Text>
      <Text style={styles.value}>{profile.username}</Text>

      <Text style={styles.label}>Full Name:</Text>
      <Text style={styles.value}>{profile.full_name || "N/A"}</Text>

      <Text style={styles.label}>Website:</Text>
      <Text style={styles.value}>{profile.website || "N/A"}</Text>

      <Text style={styles.label}>Email:</Text>
      <Text style={styles.value}>{profile.email}</Text>

      <View style={styles.buttonGroup}>
        <Button title="Edit" onPress={() => router.push("/edit-profile")} />
        <Button title="Logout" onPress={handleLogout} color="#D92D20" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, alignSelf: "center", marginBottom: 20 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginBottom: 20,
  },
  label: { fontWeight: "bold", marginTop: 10 },
  value: { fontSize: 16, marginBottom: 5 },
  buttonGroup: { marginTop: 20, gap: 10 },
  loading: { textAlign: "center", marginTop: 50 },
});
