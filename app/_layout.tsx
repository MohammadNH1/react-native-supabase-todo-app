import { Stack, Slot } from 'expo-router';
import { AuthProvider,useAuth } from '@/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

function AuthGate() {
  const { user } = useAuth();

  if (user) {
    return <Slot />; // Routes to (tabs) group
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/welcome" />
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth/register)"/>
    </Stack>
  );
}

