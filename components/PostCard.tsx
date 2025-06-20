import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { FontAwesome, Feather, Ionicons } from "@expo/vector-icons";
interface Post {
  id: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

export const PostCard = ({
  item,
  fetchPosts,
}: {
  item: Post;
  fetchPosts: () => void;
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const [liked, setLiked] = useState(false);
  const [likeId, setLikeId] = useState<string | null>(null);

  useEffect(() => {
    checkIfLiked();
  }, []);
  const checkIfLiked = async () => {
    const { data, error } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", item.id)
      .eq("user_id", user?.id)
      .single();

    if (data) {
      setLiked(true);
      setLikeId(data.id);
    } else {
      setLiked(false);
      setLikeId(null);
    }
  };
  const handleLikeToggle = async () => {
    if (!user)
      return Alert.alert("Login required", "Please login to like posts.");

    if (liked && likeId) {
      // Unlike
      const { error } = await supabase.from("likes").delete().eq("id", likeId);
      if (!error) {
        setLiked(false);
        setLikeId(null);
      }
    } else {
      // Like
      const { data, error } = await supabase
        .from("likes")
        .insert({ post_id: item.id, user_id: user.id })
        .select()
        .single();

      if (!error) {
        setLiked(true);
        setLikeId(data.id);
      }
    }
  };

  const handleEdit = () => {
    setMenuVisible(false);
    router.push({ pathname: "/edit-post", params: { id: item.id } });
  };

  const handleDelete = async () => {
    setMenuVisible(false);
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("posts")
              .delete()
              .eq("id", item.id);
            if (error) {
              Alert.alert("Delete Failed", error.message);
            } else {
              fetchPosts();
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.postCard}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <Text style={styles.postTitle}>{item.title}</Text>
        {user?.id === item?.user_id && (
          <TouchableOpacity onPress={() => setMenuVisible((prev) => !prev)}>
            <Feather name="more-vertical" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}

        <View>
          {item?.profiles?.avatar_url ? (
            <Image
              source={{ uri: item.profiles?.avatar_url }}
              style={styles.avatarforUser}
            />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}

          <Text>{item.profiles.username}</Text>
        </View>

        {/* Dropdown menu beside the icon */}
        {menuVisible && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity onPress={handleEdit} style={styles.menuItem}>
              <Feather name="edit" size={18} color="#3B82F6" />
              <Text style={styles.menuText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.menuItem}>
              <Feather name="trash-2" size={18} color="#EF4444" />
              <Text style={styles.menuText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {item.image_url && (
        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: "/post-detail", params: { id: item.id } })
          }
        >
          <Image source={{ uri: item.image_url }} style={styles.postImage} />
        </TouchableOpacity>
      )}
      <Text style={styles.postDescription}>{item.description}</Text>

      <View style={styles.iconRow}>
        <TouchableOpacity style={styles.iconButton} onPress={handleLikeToggle}>
          <FontAwesome
            name={liked ? "heart" : "heart-o"}
            size={22}
            color="#EF4444"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() =>
            router.push({ pathname: "/post-detail", params: { id: item.id } })
          }
        >
          <Feather name="message-circle" size={22} color="#3B82F6" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="share-social-outline" size={22} color="#10B981" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 20,
  },

  avatarforUser: {
    width: 50,
    height: 50,
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

  dropdownMenu: {
    position: "absolute",
    top: 30,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    paddingVertical: 4,
    width: 140,
    zIndex: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  menuText: {
    fontSize: 16,
    color: "#1F2937",
  },
});
