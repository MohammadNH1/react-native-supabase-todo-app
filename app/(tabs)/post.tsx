import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";

export default function post() {
     const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
 const router = useRouter()
  const handlePost = async () => {
    if (!title.trim() || !description.trim() || !imageUrl.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("posts").insert([
      {
        title,
        description,
        image_url: imageUrl,
        user_id: user.id,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error("Supabase insert error:", error.message);
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Post created!");
      setTitle("");
      setDescription("");
      setImageUrl("");
       router.replace('/(tabs)/home');
    }
  };

  if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      );
    }
  return (
      <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Create a New Post</Text>

        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#888"
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholderTextColor="#888"
        />

        <TextInput
          style={styles.input}
          placeholder="Image URL"
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholderTextColor="#888"
        />

        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
        ) : null}

        <TouchableOpacity
          onPress={handlePost}
          style={styles.postButton}
          disabled={loading}
        >
          <Text style={styles.postButtonText}>
            {loading ? "Posting..." : "Post"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#F8FAFC",
    flexGrow: 1,
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginBottom: 20,
    color: "#0F172A",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  postButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  postButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
