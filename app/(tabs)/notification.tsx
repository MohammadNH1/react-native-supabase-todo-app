import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { SwipeListView } from "react-native-swipe-list-view";
export default function Notification() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select(
          `
      *,
     profiles:from_user_id(
     username,
     avatar_url
     ),
      posts:post_id (
        title
      )
    `
        )
        .eq("to_user_id", user?.id)
        .order("created_at", { ascending: false });

      if (!error && data) setNotifications(data);
    };

    fetchNotifications();

    // Optionally use Realtime later for live updates
  }, [user?.id]);

  const markAsRead = async (id: number) => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    }
  };
  const renderItem = ({ item }: { item: (typeof notifications)[0] }) => {
    const actionText =
      item.type === "like" ? "liked your post" : "commented on your post";

    const router = useRouter();
    return (
      <TouchableOpacity
        style={[
        styles.card,
        !item.read && styles.unreadCard, // highlight if unread
      ]}
        onPress={() =>
          router.push({
            pathname: "/post-detail",
            params: { id: item.post_id },
          })
        }
      >
        <Image
          source={{ uri: item.profiles.avatar_url }}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.username}>{item.profiles.username}</Text>
          <Text style={styles.message}>
            {actionText}: <Text style={styles.title}>{item.posts.title}</Text>
          </Text>
          <Text style={styles.time}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHiddenItem = ({ item }: { item: (typeof notifications)[0] }) => (
    <View style={styles.hiddenItem}>
      <TouchableOpacity
        onPress={() => markAsRead(item.id)}
        style={styles.readButton}
      >
        <Text style={{ color: "white" }}>Mark Read</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SwipeListView
      data={notifications}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      renderHiddenItem={renderHiddenItem}
      rightOpenValue={-100}
      previewRowKey={"1"}
      previewOpenValue={-40}
      disableRightSwipe
      contentContainerStyle={{ padding: 16 }}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
  },
  message: {
    fontSize: 14,
  },
  title: {
    fontWeight: "bold",
    color: "#007aff",
  },
  time: {
    fontSize: 12,
    color: "#999",
  },
  hiddenItem: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    backgroundColor: "#007aff",
    borderRadius: 12,
    paddingRight: 20,
    marginBottom: 12,
  },
  readButton: {
    justifyContent: "center",
    height: "100%",
  },
  unreadCard: {
  backgroundColor: "#eef6ff", // light blue background for unread
},
});
