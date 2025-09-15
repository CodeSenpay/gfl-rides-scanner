import {
  showErrorMessage,
  showSuccessMessage,
} from "@/src/components/toastMessage";
import { useAuth } from "@/src/context/AuthContext";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";

import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Login() {
  const [usercode, setUsercode] = useState("");
  const { login } = useAuth();

  const router = useRouter();
  const fade = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(20)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;

  const handleLogin = async () => {
    const url = process.env.EXPO_PUBLIC_AUTH_API_PATH;
    console.log(url);
    if (!url) {
      throw new Error("API URL is not defined");
    }

    if (usercode.trim() === "") {
      showErrorMessage("Validation Error", "User code cannot be empty.");
      return;
    }

    try {
      const response = await axios.post(
        url,
        {
          accountCode: usercode,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === 0) {
        showErrorMessage("Login Error", response.data.message);
        return;
      }
      if (response.data.message === "success" && response.data.status === 1) {
        const user = {
          type: response.data.responseData.type,
          accountCode: response.data.responseData.accountCode,
          fullName: response.data.responseData.fullName,
        };
        showSuccessMessage("Login Success", response.data.message);
        await login(response.headers["authorization"], user);
        router.replace("/");
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideY, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={["#ff9a9e", "#8e44ad", "#fbc531"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 20,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{ opacity: fade, transform: [{ translateY: slideY }] }}
          >
            <Animated.Image
              source={require("@/assets/images/gfl-logo.png")}
              style={{
                width: 300,
                height: 250,
                alignSelf: "center",
                transform: [{ scale: logoScale }],
              }}
              resizeMode="contain"
            />

            <Text className="text-gray-100 text-center text-lg mb-6">
              Please sign in to continue
            </Text>

            {/* Username */}
            <View className="mb-4">
              <Text className="text-white font-medium">User Code</Text>
              <TextInput
                className="bg-white/80 border border-gray-300 rounded-lg p-4 mt-2"
                placeholder="Enter your username"
                placeholderTextColor="#777"
                value={usercode}
                onChangeText={setUsercode}
                autoCapitalize="none"
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className="bg-blue-600 p-4 rounded-lg mt-6"
              onPress={handleLogin}
              activeOpacity={0.9}
            >
              <Text className="text-white text-center font-semibold">
                Login
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
