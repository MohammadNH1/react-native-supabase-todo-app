import React from "react";
import { View, Text,  Button, StyleSheet,
  TouchableOpacity, } from 'react-native';
import Checkbox from 'expo-checkbox';

interface todoItemProps {
    task:{
        id:string;
        title:string;
        iscompleted:boolean
    };
    deleteTask:(id:string)=>void;
    toggleCompleted:(id:string,currentStatus:boolean)=>void;
}
export default function TodoItem({task,deleteTask,toggleCompleted}:todoItemProps) {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <Checkbox
          value={task.iscompleted}
          onValueChange={() => toggleCompleted(task.id,task.iscompleted)}
        />
        <Text
          style={[
            styles.title,
            task.iscompleted && styles.iscompleted,
          ]}
        >
          {task.title}
        </Text>
      </View>
      <TouchableOpacity onPress={() => deleteTask(task.id)}>
        <Text style={styles.delete}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}



const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 1,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  title: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
    flexShrink: 1,
  },
  iscompleted: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  delete: {
    color: "#e11d48",
    fontSize: 20,
    paddingLeft: 12,
  },
});