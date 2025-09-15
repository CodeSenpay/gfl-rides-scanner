import { AuthProvider } from "@/src/context/AuthContext";
import { Stack } from "expo-router";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import "./global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="login"
          options={{ headerShown: false, statusBarHidden: true }}
        />
        <Stack.Screen
          name="index"
          options={{ headerShown: false, statusBarHidden: true }}
        />
        <Stack.Screen
          name="scanner"
          options={{ headerShown: false, statusBarHidden: true }}
        />
      </Stack>
      <Toast />
    </AuthProvider>
  );
}
