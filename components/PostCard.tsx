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
  profiles?: {
    id:string
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
    const { data } = await supabase
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
      const { error } = await supabase.from("likes").delete().eq("id", likeId);
      if (!error) {
        setLiked(false);
        setLikeId(null);
      }
    } else {
      const { data, error } = await supabase
        .from("likes")
        .insert({ post_id: item.id, user_id: user.id })
        .select()
        .single();

      if (!error) {
        setLiked(true);
        setLikeId(data.id);

        // sent notification to the user
        const fromUserId = user?.id;
        const touserId = item?.profiles?.id
        if(!fromUserId || fromUserId ===touserId) return

        await supabase.from('notifications').insert({
          type:'like',
          from_user_id:fromUserId,
          to_user_id:touserId,
          post_id:item.id
        })
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

 // console.log('item',item)
  return (
    <View style={styles.postCard}>
      

      {/* User Info + Menu */}
      <View style={styles.userRow}>
        <View style={styles.userInfo}>
          {item?.profiles?.avatar_url ? (
            <Image
              source={{ uri: item.profiles.avatar_url }}
              style={styles.avatarSmall}
            />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.usernameText}>{item?.profiles?.username}</Text>
            <Text style={styles.dateText}>
              {new Date(item.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        {user?.id === item.user_id && (
          <TouchableOpacity onPress={() => setMenuVisible((prev) => !prev)}>
            <Feather name="more-vertical" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Dropdown Menu */}
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

{/* Title */}
      <Text style={styles.postTitle}>{item.title}</Text>
      {/* Post Image */}
      {item.image_url && (
        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: "/post-detail", params: { id: item.id } })
          }
        >
          <Image source={{ uri: item.image_url }} style={styles.postImage} />
        </TouchableOpacity>
      )}

      {/* Description */}
      <Text style={styles.postDescription}>{item.description}</Text>

      {/* Actions */}
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
  postTitle: {
     fontSize: 18,
    // fontWeight: "600",
     color: "#111827",
    marginBottom: 6,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
  },
  usernameText: {
    fontWeight: "600",
    fontSize: 16,
    color: "#111827",
  },
  dateText: {
    fontSize: 12,
    color: "#6B7280",
  },
  dropdownMenu: {
    position: "absolute",
    top: 40,
    right: 16,
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
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
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
});
