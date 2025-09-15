// context/AuthContext.tsx
import { router } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { tokenService } from "../services/apiClient";

type User = {
  type: string;
  accountCode: string;
  fullName: string;
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const storedToken = await tokenService.getToken();
      setToken(storedToken);
    } catch (error) {
      console.error("Error loading token:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string, userData: User) => {
    await tokenService.setToken(newToken);
    setToken(newToken);
    setUser(userData);
    router.replace("/"); // Redirect to main app
  };

  const logout = async () => {
    await tokenService.removeToken();
    setToken(null);
    setUser(null);
    router.replace("/login"); // Redirect to login
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
