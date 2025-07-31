import axiosInstance from "@/utils/axiosInstance";
import axiosInstanceForm from "@/utils/axiosInstanceForm";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  LogoutResponse,
} from "@/types/auth";

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const data: LoginRequest = {
      grant_type: "password",
      username: email,
      password: password,
    };

    // Преобразуем в URLSearchParams для form-data
    const formData = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    const response = await axiosInstanceForm.post<LoginResponse>(
      "/auth/login",
      formData
    );
    return response.data;
  },

  async register(
    email: string,
    password: string,
    chessLevelId: string
  ): Promise<void> {
    const data: RegisterRequest = {
      email,
      password,
      chess_level_id: chessLevelId,
    };

    await axiosInstance.post("/auth/register", data);
  },

  async logout(): Promise<LogoutResponse> {
    const response = await axiosInstance.post<LogoutResponse>("/auth/logout");
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await axiosInstance.post<LoginResponse>(
      "/auth/token/refresh",
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
    return response.data;
  },
};
