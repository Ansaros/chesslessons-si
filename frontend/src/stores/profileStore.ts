import { create } from "zustand";
import { profileService, UserProfile } from "@/services/profile";
import { attributesService, AttributeValue } from "@/services/auth";

interface ProfileState {
  profile: UserProfile | null;
  chessLevels: AttributeValue[];
  isLoading: boolean;
  isUpdating: boolean;
}

interface ProfileActions {
  loadProfile: () => Promise<void>;
  loadChessLevels: () => Promise<void>;
  updateProfile: (chess_level_id: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setUpdating: (updating: boolean) => void;
}

export const useProfileStore = create<ProfileState & ProfileActions>(
  (set, get) => ({
    // Состояние
    profile: null,
    chessLevels: [],
    isLoading: false,
    isUpdating: false,

    // Загрузка профиля
    loadProfile: async () => {
      try {
        set({ isLoading: true });
        const profile = await profileService.getProfile();
        set({ profile, isLoading: false });
      } catch (error) {
        console.error("Failed to load profile:", error);
        set({ isLoading: false });
        throw error;
      }
    },

    // Загрузка уровней шахмат
    loadChessLevels: async () => {
      try {
        const levels = await attributesService.getChessLevels();
        set({ chessLevels: levels });
      } catch (error) {
        console.error("Failed to load chess levels:", error);
      }
    },

    // Обновление профиля
    updateProfile: async (chess_level_id: string) => {
      try {
        set({ isUpdating: true });
        await profileService.updateProfile(chess_level_id);

        // Обновляем локальное состояние
        const currentProfile = get().profile;
        if (currentProfile) {
          set({
            profile: { ...currentProfile, chess_level_id },
            isUpdating: false,
          });
        }
      } catch (error) {
        set({ isUpdating: false });
        throw error;
      }
    },

    // Смена пароля
    updatePassword: async (password: string) => {
      try {
        set({ isUpdating: true });
        await profileService.updatePassword(password);
        set({ isUpdating: false });
      } catch (error) {
        set({ isUpdating: false });
        throw error;
      }
    },

    // Управление состоянием
    setLoading: (loading: boolean) => set({ isLoading: loading }),
    setUpdating: (updating: boolean) => set({ isUpdating: updating }),
  })
);
