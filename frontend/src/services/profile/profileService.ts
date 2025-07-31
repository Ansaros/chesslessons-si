import axiosInstance from "@/utils/axiosInstance";
import type {
  UserProfile,
  UpdateProfileRequest,
  UpdatePasswordRequest,
} from "@/types/profile";

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    const response = await axiosInstance.get<UserProfile>("/profile");
    return response.data;
  },

  async updateProfile(chess_level_id: string): Promise<void> {
    const data: UpdateProfileRequest = { chess_level_id };
    await axiosInstance.put("/profile", data);
  },

  async updatePassword(password: string): Promise<void> {
    const data: UpdatePasswordRequest = { password };
    await axiosInstance.put("/profile/password", data);
  },
};
