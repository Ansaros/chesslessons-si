import axios, { AxiosResponse } from 'axios';
import { z } from 'zod';

const NEXT_PUBLIC_API_BACKEND_URL = process.env.NEXT_PUBLIC_API_BACKEND_URL;

const registerSchema = z.object({
    email: z.string().email("Неверный формат почты"),
    password: z.string().min(1, "Укажите пароль"),
    chess_level: z.string().min(1, "Укажите ваш уровень игры"),
});

const loginSchema = z.object({
    grant_type: z.string().regex(/^password$/, "Grant type must be password").optional(),
    username: z.string().min(1, "Укажите имя"),
    password: z.string().min(1, "Укажите пароль"),
    scope: z.string().optional(),
    client_id: z.string().optional().nullable(),
    client_secret: z.string().optional().nullable(),
});

const passwordRecoverySchema = z.object({
    email: z.email("Неверный формат почты")
});

const passwordResetSchema = z.object({
    token: z.string().min(1, "Требуется токен сброса"),
    password: z.string().min(1, "Укажите пароль"),
});

interface ValidationError {
    detail: Array<{
        loc: (string | number)[],
        msg: string,
        type: string,
    }>
}

interface TokenResponse {
    access_token: string;
    refresh_token?: string;
    token_type: string;
}

interface StatusResponse {
    message: string;
}

const createValidationError = (field: string, message: string): ValidationError => ({
    detail: [{
        loc: [field],
        msg: message,
        type: "value_error",
    }]
});

const authApi = axios.create({
    baseURL: process.env.NODE_ENV === 'development' 
        ? '/api/auth'
        : `${NEXT_PUBLIC_API_BACKEND_URL}/auth`,
    timeout: 10000,
});

class TokenStorage {
    static setTokens(accessToken: string, refreshToken?: string, rememberMe: boolean = false) {
        const storage = rememberMe ? localStorage : sessionStorage;
        
        storage.setItem("access_token", accessToken);
        if (refreshToken) {
            storage.setItem("refresh_token", refreshToken);
        }
        storage.setItem("remember_me", rememberMe.toString());
        
        // Clear from the other storage to avoid conflicts
        const otherStorage = rememberMe ? sessionStorage : localStorage;
        otherStorage.removeItem("access_token");
        otherStorage.removeItem("refresh_token");
        otherStorage.removeItem("remember_me");
    }
    
    static getAccessToken(): string | null {
        return localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    }
    
    static getRefreshToken(): string | null {
        return localStorage.getItem("refresh_token") || sessionStorage.getItem("refresh_token");
    }
    
    static isRemembered(): boolean {
        const remembered = localStorage.getItem("remember_me") || sessionStorage.getItem("remember_me");
        return remembered === "true";
    }
    
    static clearTokens() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("remember_me");
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
        sessionStorage.removeItem("remember_me");
    }
}

class AuthService {
    async register(data: { email: string; password: string; chess_level: string }): Promise<TokenResponse> {
        try {
            const validatedData = registerSchema.parse(data);
            const response: AxiosResponse<TokenResponse> = await authApi.post('/register', validatedData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const detail = error.issues.map(err => ({
                    loc: err.path,
                    msg: err.message,
                    type: err.code,
                }));
                throw { detail, status: 422 };
            }
            if (axios.isAxiosError(error)) {
                throw {
                    detail: error.response?.data?.detail || createValidationError("server", "Registration failed").detail,
                    status: error.response?.status || 500
                };
            }
            throw createValidationError("server", "Internal server error");
        }
    }

    async login(formData: FormData, rememberMe: boolean = false): Promise<TokenResponse> {
        try {
            const loginData = {
                grant_type: formData.get("grant_type"),
                username: formData.get("username"),
                password: formData.get("password"),
                scope: formData.get("scope"),
                client_id: formData.get("client_id"),
                client_secret: formData.get("client_secret"),
            };

            const cleanedData: Record<string, string> = {};
            Object.entries(loginData).forEach(([key, value]) => {
                if (value !== null && value !== "") {
                    cleanedData[key] = typeof value === "string" ? value : value?.toString() || "";
                }
            });

            if (!cleanedData.username) {
                throw {
                    detail: [{
                        loc: ["username"],
                        msg: "Username is required",
                        type: "value_error.missing"
                    }],
                    status: 422
                };
            }

            if (!cleanedData.password) {
                throw {
                    detail: [{
                        loc: ["password"],
                        msg: "Password is required",
                        type: "value_error.missing"
                    }],
                    status: 422
                };
            }

            const validatedData = loginSchema.parse(cleanedData);

            const backendFormData = new FormData();
            Object.entries(validatedData).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    backendFormData.append(key, value.toString());
                }
            });

            const response: AxiosResponse<TokenResponse> = await authApi.post('/login', backendFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            TokenStorage.setTokens(
                response.data.access_token, 
                response.data.refresh_token, 
                rememberMe
            );

            return response.data;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const detail = error.issues.map(err => ({
                    loc: err.path,
                    msg: err.message,
                    type: err.code,
                }));
                throw { detail, status: 422 };
            }
            if (axios.isAxiosError(error)) {
                throw {
                    detail: error.response?.data?.detail || createValidationError("server", "Login failed").detail,
                    status: error.response?.status || 500
                };
            }
            if (error && typeof error === 'object' && 'detail' in error) {
                throw error;
            }
            throw createValidationError("server", "Internal server error");
        }
    }

    async refreshToken(): Promise<TokenResponse> {
        try {
            const refreshToken = TokenStorage.getRefreshToken();
            
            if (!refreshToken) {
                throw {
                    detail: createValidationError("authorization", "Missing refresh token").detail,
                    status: 401
                };
            }

            const response: AxiosResponse<TokenResponse> = await authApi.post('/token/refresh', {}, {
                headers: {
                    'Authorization': `Bearer ${refreshToken}`,
                }
            });

            const rememberMe = TokenStorage.isRemembered();
            TokenStorage.setTokens(
                response.data.access_token,
                response.data.refresh_token || refreshToken, 
                rememberMe
            );

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                TokenStorage.clearTokens();
                throw {
                    detail: error.response?.data?.detail || createValidationError("server", "Token refresh failed").detail,
                    status: error.response?.status || 500
                };
            }
            throw createValidationError("server", "Internal server error");
        }
    }

    async passwordRecovery(email: string): Promise<StatusResponse> {
        try {
            const validatedData = passwordRecoverySchema.parse({ email });
            const response: AxiosResponse<StatusResponse> = await authApi.post('/password/recovery', validatedData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const detail = error.issues.map(err => ({
                    loc: err.path,
                    msg: err.message,
                    type: err.code,
                }));
                throw { detail, status: 422 };
            }
            if (axios.isAxiosError(error)) {
                throw {
                    detail: error.response?.data?.detail || createValidationError("server", "Password recovery failed").detail,
                    status: error.response?.status || 500
                };
            }
            throw createValidationError("server", "Internal server error");
        }
    }

    async passwordReset(token: string, password: string): Promise<TokenResponse> {
        try {
            const validatedData = passwordResetSchema.parse({ token, password });
            const response: AxiosResponse<TokenResponse> = await authApi.post('/password/reset', validatedData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            TokenStorage.setTokens(
                response.data.access_token,
                response.data.refresh_token,
                false
            );

            return response.data;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const detail = error.issues.map(err => ({
                    loc: err.path,
                    msg: err.message,
                    type: err.code,
                }));
                throw { detail, status: 422 };
            }
            if (axios.isAxiosError(error)) {
                throw {
                    detail: error.response?.data?.detail || createValidationError("server", "Password reset failed").detail,
                    status: error.response?.status || 500
                };
            }
            throw createValidationError("server", "Internal server error");
        }
    }

    async logout(): Promise<StatusResponse> {
        try {
            const refreshToken = TokenStorage.getRefreshToken();
            
            let response: AxiosResponse<StatusResponse>;
            
            if (refreshToken) {
                response = await authApi.post('/logout', {}, {
                    headers: {
                        'Authorization': `Bearer ${refreshToken}`,
                    }
                });
            } else {
                response = { data: { message: "Logged out successfully" } } as AxiosResponse<StatusResponse>;
            }

            TokenStorage.clearTokens();
            
            return response.data;
        } catch (error) {
            TokenStorage.clearTokens();
            
            if (axios.isAxiosError(error)) {
                throw {
                    detail: error.response?.data?.detail || createValidationError("server", "Logout failed").detail,
                    status: error.response?.status || 500
                };
            }
            throw createValidationError("server", "Internal server error");
        }
    }

    isAuthenticated(): boolean {
        return !!TokenStorage.getAccessToken();
    }

    getAccessToken(): string | null {
        return TokenStorage.getAccessToken();
    }

    isRemembered(): boolean {
        return TokenStorage.isRemembered();
    }

    async ensureValidToken(): Promise<string | null> {
        const accessToken = TokenStorage.getAccessToken();
        if (!accessToken) return null;

        try {
            return accessToken;
        } catch (error) {
            try {
                const response = await this.refreshToken();
                return response.access_token;
            } catch (refreshError) {
                TokenStorage.clearTokens();
                return null;
            }
        }
    }
}

export const authService = new AuthService();

export { TokenStorage };

export type { ValidationError, TokenResponse, StatusResponse };
export { registerSchema, loginSchema, passwordRecoverySchema, passwordResetSchema };