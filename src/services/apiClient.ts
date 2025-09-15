// lib/api.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Create axios instance
export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BASE_API_PATH,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management
export const tokenService = {
  // Store token securely
  setToken: async (token: string) => {
    try {
      await SecureStore.setItemAsync("jwtToken", token);
    } catch (error) {
      console.error("Error storing token:", error);
    }
  },

  // Get token
  getToken: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync("jwtToken");
    } catch (error) {
      console.error("Error retrieving token:", error);
      return null;
    }
  },

  // Remove token (logout)
  removeToken: async () => {
    try {
      await SecureStore.deleteItemAsync("jwtToken");
    } catch (error) {
      console.error("Error removing token:", error);
    }
  },
};

// Request interceptor to add token to all requests
api.interceptors.request.use(
  async (config) => {
    const token = await tokenService.getToken();
    console.log("Attaching token to request:", token);
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and auth errors
// api.interceptors.response.use(
//   (response) => {
//     // Check if response contains a new token
//     const newToken =
//       response.headers["authorization"] || response.headers["Authorization"];
//     if (newToken && newToken.startsWith("Bearer ")) {
//       const token = newToken.substring(7);
//       tokenService.setToken(token);
//     }
//     return response;
//   },

//   async (error) => {
//     if (error.response?.status === 401) {
//       // Token expired or invalid
//       await tokenService.removeToken();
//       // You might want to redirect to login here
//       // For Expo Router, you can use router.replace('/login')
//     }
//     return Promise.reject(error);
//   }
// );

export default api;
