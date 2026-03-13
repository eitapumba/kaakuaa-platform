import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, usersApi } from '../api/client';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  rank: string;
  vitaBalance: number;
  challengesCompleted: number;
  challengesWon: number;
  currentStreak: number;
  totalEarnings: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  googleLogin: (googleId: string, email: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-login on app start
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          const { data } = await usersApi.getMe();
          setUser(data);
        }
      } catch {
        await AsyncStorage.removeItem('accessToken'); await AsyncStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const saveTokens = async (accessToken: string, refreshToken: string) => {
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
  };

  const login = useCallback(async (email: string, password: string) => {
    const { data: tokens } = await authApi.login({ email, password });
    await saveTokens(tokens.accessToken, tokens.refreshToken);
    const { data: userData } = await usersApi.getMe();
    setUser(userData);
  }, []);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    const { data: tokens } = await authApi.register({ email, password, displayName });
    await saveTokens(tokens.accessToken, tokens.refreshToken);
    const { data: userData } = await usersApi.getMe();
    setUser(userData);
  }, []);

  const googleLogin = useCallback(async (googleId: string, email: string, displayName: string) => {
    const { data: tokens } = await authApi.googleAuth({ googleId, email, displayName });
    await saveTokens(tokens.accessToken, tokens.refreshToken);
    const { data: userData } = await usersApi.getMe();
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('accessToken'); await AsyncStorage.removeItem('refreshToken');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await usersApi.getMe();
      setUser(data);
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      googleLogin,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
