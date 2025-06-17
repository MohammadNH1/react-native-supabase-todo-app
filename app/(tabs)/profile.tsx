import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { PostCard } from "@/components/PostCard";
interface Post {
  id: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
  user_id:string
}
export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const router = useRouter();
  const { user } = useAuth();
  const fetchProfile = async () => {
    try {
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("username, full_name, website, avatar_url")
        .eq("id", user?.id)
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

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", user?.id)
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
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
      ListHeaderComponent={
        <View>
          {profile?.avatar_url ? (
            <Image
              source={{ uri: profile?.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}

          <Text style={styles.label}>Username:</Text>
          <Text style={styles.value}>{profile?.username}</Text>

          <Text style={styles.label}>Full Name:</Text>
          <Text style={styles.value}>{profile?.full_name || "N/A"}</Text>

          <Text style={styles.label}>Website:</Text>
          <Text style={styles.value}>{profile?.website || "N/A"}</Text>

          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{profile?.email}</Text>

          <View style={styles.buttonGroup}>
            <Button title="Edit" onPress={() => router.push("/edit-profile")} />
            <Button title="Logout" onPress={handleLogout} color="#D92D20" />
          </View>

          <Text style={styles.sectionHeader}>🔥 Your Posts</Text>
        </View>
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
  container: { padding: 20 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 20,
  },
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
  con: {
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
  menuContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 8,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  menuText: {
    fontSize: 14,
    color: "#374151",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalMenu: {
    width: 200,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    elevation: 5,
  },
  // menuItem: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   paddingVertical: 10,
  //   gap: 8,
  // },
  // menuText: {
  //   fontSize: 16,
  //   color: "#1F2937",
  // },
});
