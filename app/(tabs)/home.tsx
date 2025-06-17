import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { FontAwesome, Feather, Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { PostCard } from "@/components/PostCard";

interface Post {
  id: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
  user_id:string
}
export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      Alert.alert("Error fetching posts", error.message);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);
  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.postImage} />
      ) : null}
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postDescription}>{item.description}</Text>

      <View style={styles.iconRow}>
        <TouchableOpacity style={styles.iconButton}>
          <FontAwesome name="heart-o" size={22} color="#EF4444" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="message-circle" size={22} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="share-social-outline" size={22} color="#10B981" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }
  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <PostCard item={item} fetchPosts={fetchPosts} />
      )}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <Text style={styles.sectionHeader}>🔥 Latest Posts</Text>
      }
      ListFooterComponent={
        <View style={styles.footer}>
          <Text style={styles.footerText}>End of the feed</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No posts available 😞</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  postDescription: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 12,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  iconButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1F2937",
    textAlign: "center",
  },
  footer: {
    marginTop: 20,
    paddingVertical: 10,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#6B7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
