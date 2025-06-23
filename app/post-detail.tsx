import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Feather, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*,profiles(id)")
      .eq("id", id)
      .single();
    if (!error) setPost(data);
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*, profiles(username, avatar_url)")
      .eq("post_id", id)
      .order("created_at", { ascending: false });
    if (error) {
      Alert.alert("Error Fetching Comment", error.message);
      return;
    }

    setComments(data);
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    const { error } = await supabase.from("comments").insert({
      post_id: id,
      user_id: user?.id,
      content: newComment,
    });
    if (error) {
      Alert.alert("Error creating Comment", error.message);
      return;
    }
    setNewComment("");
    fetchComments();

    // sent notification to the user
    const fromUserId = user?.id;
    const touserId = post?.profiles?.id;
    if (!fromUserId || fromUserId === touserId) return;
    await supabase.from("notifications").insert({
      type: "comment",
      from_user_id: fromUserId,
      to_user_id: touserId,
      post_id: post.id,
    });
  };

  const handleDeleteComment = async (commentId: string) => {
    Alert.alert("Delete Comment", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("comments")
            .delete()
            .eq("id", commentId);
          if (error) {
            Alert.alert("Error deleting Comment", error.message);
            return;
          }
          fetchComments();
        },
      },
    ]);
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, []);

  if (!post) return <Text style={styles.loading}>Loading...</Text>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ marginRight: 10 }}
              >
                <Ionicons name="arrow-back" size={24} color="#111827" />
              </TouchableOpacity>
              <Text style={styles.title}>{post.title}</Text>
            </View>

            {post.image_url && (
              <Image source={{ uri: post.image_url }} style={styles.image} />
            )}

            <Text style={styles.description}>{post.description}</Text>

            <Text style={styles.commentHeading}>Comments</Text>

            {comments.length === 0 ? (
              <Text style={{ color: "#6B7280" }}>No comments yet.</Text>
            ) : (
              comments.map((item) => (
                <View key={item.id} style={styles.commentCard}>
                  {item.profiles?.avatar_url ? (
                    <Image
                      source={{ uri: item.profiles?.avatar_url }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder} />
                  )}
                  <View style={styles.commentContent}>
                    <Text style={styles.username}>
                      {item.profiles?.username || "User"}
                    </Text>
                    <Text>{item.content}</Text>
                  </View>
                  {(item.user_id === user?.id || post.user_id === user?.id) && (
                    <TouchableOpacity
                      onPress={() => handleDeleteComment(item.id)}
                      style={styles.deleteIcon}
                    >
                      <Feather name="trash-2" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </TouchableWithoutFeedback>

        <View style={styles.commentInputRow}>
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Write a comment..."
            style={styles.commentInput}
          />
          <TouchableOpacity onPress={handleCommentSubmit}>
            <Feather name="send" size={22} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  loading: {
    marginTop: 100,
    textAlign: "center",
    fontSize: 16,
    color: "#6B7280",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    flexShrink: 1,
  },
  avatarPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 50,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginBottom: 20,
    marginRight: 10,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    color: "#374151",
  },
  commentHeading: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1F2937",
  },
  commentCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  username: {
    fontWeight: "600",
    marginBottom: 2,
  },
  deleteIcon: {
    paddingLeft: 8,
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  commentInput: {
    flex: 1,
    paddingRight: 8,
    fontSize: 16,
  },
});
