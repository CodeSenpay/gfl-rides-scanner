import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
export default function Dashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  return (
    <LinearGradient
      colors={["#ff9a9e", "#8e44ad", "#fbc531"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      {/* Sign Out Button at Top Right */}
      <View className="absolute top-12 right-4 z-10">
        <TouchableOpacity
          className="bg-red-600 p-3 rounded-full shadow-lg flex-row items-center"
          activeOpacity={0.9}
          onPress={() => {
            logout();
            router.replace("/login");
          }}
        >
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text className="text-white font-semibold ml-2">Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 justify-center items-center p-8 gap-4">
        {/* Logo */}
        <Image
          source={require("@/assets/images/gfl-logo.png")}
          style={{ width: 200, height: 180, marginBottom: 50 }}
          resizeMode="contain"
        />
        <Text className="text-white text-lg mb-6 font-semibold">
          Welcome, {user?.fullName} ({user?.type})
        </Text>
        {/* Start Scanning Button */}
        <View className="flex flex-col gap-8">
          <TouchableOpacity
            className="bg-blue-600 px-10 py-5 rounded-full shadow-lg"
            activeOpacity={0.9}
            onPress={() => router.push("/scanner")}
          >
            <Text className="text-white text-xl font-semibold">
              Start Scanning
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}
