
import { create } from "zustand";
import { profileService, UserProfile } from "@/services/profile";

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  isUpdating: boolean;
}

interface ProfileActions {
  loadProfile: (force?: boolean) => Promise<void>;
  updateProfile: (chess_level_id: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setUpdating: (updating: boolean) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState & ProfileActions>(
  (set, get) => ({
    // Состояние
    profile: null,
    isLoading: false,
    isUpdating: false,

    // Загрузка профиля
    loadProfile: async (force = false) => {
      if (!force && (get().profile || get().isLoading)) {
        return;
      }
      try {
        set({ isLoading: true });
        const profile = await profileService.getProfile();
        set({ profile, isLoading: false });
      } catch (error) {
        console.error("Failed to load profile:", error);
        set({ profile: null, isLoading: false });
      }
    },

    // Обновление профиля
    updateProfile: async (chess_level_id: string) => {
      set({ isUpdating: true });
      try {
        await profileService.updateProfile(chess_level_id);
        await get().loadProfile(true); // Force reload profile data to reflect changes
      } catch (error) {
        throw error;
      } finally {
        set({ isUpdating: false });
      }
    },

    // Смена пароля
    updatePassword: async (password: string) => {
      set({ isUpdating: true });
      try {
        await profileService.updatePassword(password);
      } catch (error) {
        throw error;
      } finally {
        set({ isUpdating: false });
      }
    },

    // Управление состоянием
    setLoading: (loading: boolean) => set({ isLoading: loading }),
    setUpdating: (updating: boolean) => set({ isUpdating: updating }),
    clearProfile: () => set({ profile: null, isLoading: false, isUpdating: false }),
  })
);
