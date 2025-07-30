export interface Profile {
  email: string;
  chess_level_id: string;
}

export interface ProfileUpdate {
  chess_level_id: string;
}

export interface PasswordUpdate {
  password: string;
}

export interface ChessLevel {
  id: string;
  value: string;
}

export interface ChessLevelType {
  id: string;
  name: string;
  values: ChessLevel[];
}

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_BACKEND_URL ?? "";
const API_BASE_URL = typeof window !== 'undefined' ? window.location.origin : "";

const getHeaders = (token?: string) => {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
};

const handleAxiosResp = async <T>(promise: Promise<any>): Promise<T> => {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.detail ?? JSON.stringify(error.response.data));
    }
    throw error;
  }
};

export class ProfileService {
  private token?: string;
  
  constructor(token?: string) {
    this.token = token;
  }
  
  setToken(t: string) {
    this.token = t;
  }

  async getProfile(): Promise<Profile> {
    return handleAxiosResp<Profile>(
      axios.get(`${API_BASE_URL}/api/profile`, {
        headers: getHeaders(this.token),
      })
    );
  }

  async updateProfile(data: ProfileUpdate): Promise<Profile> {
    return handleAxiosResp<Profile>(
      axios.put(`${API_BASE_URL}/api/profile`, data, {
        headers: getHeaders(this.token),
      })
    );
  }

  async updatePassword(data: PasswordUpdate): Promise<Profile> {
    return handleAxiosResp<Profile>(
      axios.put(`${API_BASE_URL}/api/profile/password`, data, {
        headers: getHeaders(this.token),
      })
    );
  }

  async getChessLevels(): Promise<ChessLevel[]> {
    const response = await handleAxiosResp<{ data: ChessLevelType[] }>(
      axios.get(`${API_BASE_URL}/api/profile/chess-levels`, {
        headers: getHeaders(this.token),
      })
    );
    
    // Find the chess level attribute type and return its values
    const chessLevelType = response.data.find(type => 
      type.name.toLowerCase().includes('chess') || 
      type.name.toLowerCase().includes('level') ||
      type.name.toLowerCase().includes('уровень')
    );
    
    return chessLevelType?.values || [];
  }
}

export const profileService = new ProfileService();