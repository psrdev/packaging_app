import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client, { API_URL } from '../api/client';
import { getMe, login as apiLogin, logout as apiLogout } from '../api/auth';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (payload: Record<string, string>) => Promise<void>;
  signOut: () => Promise<void>;
  apiUrl: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = API_URL;

  // Restore session on boot
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('AUTH_TOKEN');
        if (savedToken) {
          setToken(savedToken);
          // Fetch current profile to validate the token
          const profile = await getMe();
          setUser(profile);
        }
      } catch (err) {
        // Clear invalid tokens on failure
        await AsyncStorage.removeItem('AUTH_TOKEN');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  // Axios response interceptor to handle automated logouts on 401 Unauthorized
  useEffect(() => {
    const interceptor = client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('AUTH_TOKEN');
          setToken(null);
          setUser(null);
        }
        return Promise.reject(error);
      }
    );
    return () => {
      client.interceptors.response.eject(interceptor);
    };
  }, []);

  const signIn = async (payload: Record<string, string>) => {
    setIsLoading(true);
    try {
      const data = await apiLogin(payload);
      await AsyncStorage.setItem('AUTH_TOKEN', data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      if (token) {
        await apiLogout().catch(() => {}); // Call logout endpoint but continue even if it fails
      }
    } finally {
      await AsyncStorage.removeItem('AUTH_TOKEN');
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut, apiUrl }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
