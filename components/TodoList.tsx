import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Alert,
} from "react-native";
import TodoItem from "./TodoItem";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
export default function TodoList() {
  const [tasks, setTasks] = useState([
    { id: "1", title: "Read a book", iscompleted: true },
    { id: "2", title: "Meet with friend", iscompleted: false },
  ]);
  const [title, setTitle] = useState("");
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const fetchTodo = async () => {
    try {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;
      if (data) {
        console.log('data',data)
        setTasks(data);
      }
    } catch (error: any) {
      console.log('error',error)
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodo();
  }, []);

  const addTask = async() => {
    if (!title.trim()) return;
    const newTask = {
      title,
      iscompleted:false,
      user_id:user?.id
    };
    //setTasks([newTask, ...tasks]);
    const {error,data} = await supabase.from("todos").insert(newTask)
    if (error) {
    console.log('Insert error:', error.message);
    Alert.alert("Error", error.message);
  } else {
    console.log('Inserted task:', data);
    // Optionally: fetch updated task list
    fetchTodo();
  }

  setTitle("");
  };

  const deleteTask = async (id: string) => {
  const { error } = await supabase.from('todos').delete().eq('id', id);
  if (error) {
    console.log("Delete error:", error.message);
    Alert.alert("Error", error.message);
    return;
  }

  // Update local state
  setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
};


  const toggleCompleted = async (id: string, currentStatus: boolean) => {
  const { error } = await supabase
    .from('todos')
    .update({ iscompleted: !currentStatus })
    .eq('id', id);

  if (error) {
    console.log("Update error:", error.message);
    Alert.alert("Error", error.message);
    return;
  }

  // Update local state
  setTasks((prevTasks) =>
    prevTasks.map((task) =>
      task.id === id ? { ...task, iscompleted: !currentStatus } : task
    )
  );
};


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>My To-Do List</Text>

      {/* Input and Button at the top */}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="What do you need to do?"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />
        <TouchableOpacity onPress={addTask} style={styles.addButton}>
          <Text style={styles.addButtonText}>＋</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TodoItem
            task={item}
            deleteTask={deleteTask}
            toggleCompleted={toggleCompleted}
          />
        )}
        contentContainerStyle={styles.taskList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  addButton: {
    backgroundColor: "#4F46E5",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 24,
  },
  taskList: {
    paddingBottom: 100,
  },
});
