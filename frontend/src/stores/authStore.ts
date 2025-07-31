import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService, attributesService } from "@/services/auth";
import type { AuthState, User } from "@/types/auth";

interface AuthActions {
  // Методы авторизации
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    chessLevelId: string
  ) => Promise<void>;
  logout: () => Promise<void>;

  // Загрузка данных
  loadChessLevels: () => Promise<void>;
  initializeAuth: () => void;

  // Управление состоянием
  setLoading: (loading: boolean) => void;
  setTokens: (tokens: { access: string; refresh: string } | null) => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Начальное состояние
      isAuthenticated: false,
      isLoading: false,
      tokens: null,
      chessLevels: [],
      user: null,

      // Методы авторизации
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });

          const response = await authService.login(email, password);

          const tokens = {
            access: response.access_token,
            refresh: response.refresh_token,
          };

          // Сохраняем токены в localStorage для interceptors
          localStorage.setItem("accessToken", response.access_token);
          localStorage.setItem("refreshToken", response.refresh_token);

          set({
            isAuthenticated: true,
            tokens,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (
        email: string,
        password: string,
        chessLevelId: string
      ) => {
        try {
          set({ isLoading: true });

          await authService.register(email, password, chessLevelId);

          // После успешной регистрации автоматически логинимся
          await get().login(email, password);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          // Очищаем состояние независимо от результата API
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");

          set({
            isAuthenticated: false,
            tokens: null,
            user: null,
          });
        }
      },

      // Загрузка данных
      loadChessLevels: async () => {
        try {
          const levels = await attributesService.getChessLevels();
          set({ chessLevels: levels });
        } catch (error) {
          console.error("Failed to load chess levels:", error);
        }
      },

      initializeAuth: () => {
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        if (accessToken && refreshToken) {
          set({
            isAuthenticated: true,
            tokens: {
              access: accessToken,
              refresh: refreshToken,
            },
          });
        }

        // Загружаем уровни шахмат при инициализации
        get().loadChessLevels();
      },

      // Управление состоянием
      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setTokens: (tokens: { access: string; refresh: string } | null) => {
        if (tokens) {
          localStorage.setItem("accessToken", tokens.access);
          localStorage.setItem("refreshToken", tokens.refresh);
          set({ tokens, isAuthenticated: true });
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          set({ tokens: null, isAuthenticated: false });
        }
      },

      setUser: (user: User | null) => set({ user }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
