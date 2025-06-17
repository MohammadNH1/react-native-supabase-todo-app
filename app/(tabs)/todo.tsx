import TodoList from '@/components/TodoList';
import React from 'react';
import { View, Text } from 'react-native';

const Todo = () => {
  return (
    <View style={{flex:1}}>
      <TodoList/>
    </View>
  );
};

export default Todo;
