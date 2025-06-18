import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

export default function EditPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
console.log('uploading',uploading)
  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        Alert.alert("Error", error.message);
        router.back();
      } else {
        setTitle(data.title);
        setDescription(data.description);
        setImageUrl(data.image_url || "");
      }
      setLoading(false);
    };

    if (id) fetchPost();
  }, [id]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selected = result.assets[0];
      console.log('url',selected.uri)
      uploadImage(selected.uri);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      const ext = uri.split(".").pop();
      const filename = `${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("post-image") // replace with your actual bucket name
        .upload(filename, blob, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("post-image")
        .getPublicUrl(filename);
      setImageUrl(data.publicUrl);
      Alert.alert("Uploaded", "Image uploaded successfully!");
    } catch (err: any) {
      Alert.alert("Upload Error", err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!title.trim()) return Alert.alert("Title required");

    const { error } = await supabase
      .from("posts")
      .update({ title, description, image_url: imageUrl })
      .eq("id", id);

    if (error) return Alert.alert("Update failed", error.message);
    Alert.alert("Success", "Post updated");
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter post title"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 120 }]}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter description"
        multiline
      />

      <Text style={styles.label}>Image URL</Text>
      <TextInput
        style={styles.input}
        value={imageUrl}
        onChangeText={setImageUrl}
        placeholder="https://..."
      />

      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.preview} />
      ) : null}

      {/* <Button
        title={uploading ? "Uploading..." : "Upload New Image"}
        onPress={pickImage}
        disabled={uploading}
      /> */}

      <View style={{ height: 20 }} />

      <Button title="Update Post" onPress={handleUpdate} color="#6366F1" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop:80,
    padding: 20,
    backgroundColor: "#F9FAFB",
    flexGrow: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 6,
    color: "#1F2937",
  },
  button:{
position: 'absolute',
  top: 20,
  left: 10,
  zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  preview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

});
