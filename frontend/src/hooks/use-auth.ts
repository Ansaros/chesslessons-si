"use client";

import { useState, useEffect, useCallback } from 'react';
import { authService, TokenStorage } from "@/services/auth/auth-service"; 

interface User {
  email?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  isRemembered: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    isRemembered: false,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await authService.ensureValidToken();
        const isRemembered = TokenStorage.isRemembered();
        
        if (token) {
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: {},
            isRemembered,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            isRemembered: false,
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          isRemembered: false,
        });
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe: boolean = false) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);
      formData.append("grant_type", "password");

      const response = await authService.login(formData, rememberMe);
      
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: { email },
        isRemembered: rememberMe,
      });

      return response;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      }));
      throw error;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, chessLevel: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await authService.register({
        email,
        password,
        chess_level: chessLevel,
      });

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: { email },
        isRemembered: false, 
      });

      return response;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        isRemembered: false,
      });
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await authService.refreshToken();
      return response;
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        isRemembered: false,
      });
      throw error;
    }
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    refreshToken,
    getAccessToken: () => TokenStorage.getAccessToken(),
    isTokenValid: () => authService.isAuthenticated(),
  };
};