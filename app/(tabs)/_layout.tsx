import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import Octicons from '@expo/vector-icons/Octicons';
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
      name="home"
      options={{
        title:'Home',
        tabBarIcon:({color})=><FontAwesome name='home' size={24} color={color}/>
      }}
      />
      
      <Tabs.Screen
      name="post"
      options={{
        title:"Post",
        tabBarIcon:({color})=><FontAwesome name='plus-square' size={24} color={color}/>
      }}
      />
      <Tabs.Screen
      name='todo'
      options={{
        title:'Todo',
        tabBarIcon:({color})=><Octicons name="tasklist" size={24} color={color} />
      }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}