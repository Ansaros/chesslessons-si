"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService, TokenResponse, TokenStorage } from '@/services/auth/auth-service';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: string | null;
    login: (formData: FormData, rememberMe?: boolean) => Promise<TokenResponse>;
    logout: () => Promise<void>;
    checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    const checkAuth = async () => {
        const token = await authService.ensureValidToken();
        const authenticated = !!token;
        
        console.log('Auth check - Token exists:', !!token);
        console.log('Auth check - Is remembered:', TokenStorage.isRemembered());
        setIsAuthenticated(authenticated);

    };


    const login = async (formData: FormData, rememberMe: boolean = false) => {
        try {
            const response = await authService.login(formData, rememberMe);
            setIsAuthenticated(true);
            console.log('Auth context - Login successful, remember me:', rememberMe);
            return response;
        } catch (error) {
            setIsAuthenticated(false);
            throw error;
        }
    };



    const logout = useCallback( async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem("user_email");
            sessionStorage.removeItem("user_email");
            console.log('Auth context - User logged out');
        }
    }, []);

    useEffect(() => {
        const initialize = () => {
            checkAuth();
            setIsLoading(false);
        };

        initialize();

        const interval = setInterval(checkAuth, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const checkTokenValidity = async () => {
            const token = TokenStorage.getAccessToken();
            if (token) {
                try {
                    const isValid = await authService.ensureValidToken();
                    if (!isValid) {
                        console.warn("Token expired - forcing logout");
                        await logout();
                    }
                } catch (error) {
                    console.error('Token validation error:', error);
                }
            }
        };

        const interval = setInterval(checkTokenValidity, 300000); // Проверка каждые 5 минут
        return () => clearInterval(interval);
    }, [logout]);

    const value = {
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

interface ProtectedRouteProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const ProtectedRoute = ({ children, fallback }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        if (fallback) {
            return <>{fallback}</>;
        }

        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
        return null;
    }

    return <>{children}</>;
};