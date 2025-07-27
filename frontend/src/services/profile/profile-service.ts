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

const API_URL = process.env.NEXT_PUBLIC_API_BACKEND_URL ?? "";

const getHeaders = (token?: string) => {
  const h: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
};

const handleResp = async <T>(r: Response): Promise<T> => {
  if (!r.ok) {
    const msg = await r.text();
    throw new Error(JSON.parse(msg).detail ?? msg);
  }
  return r.json();
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
    const res = await fetch(`${API_URL}/profile`, {
      headers: getHeaders(this.token),
    });
    return handleResp<Profile>(res);
  }

  async updateProfile(data: ProfileUpdate): Promise<Profile> {
    const res = await fetch(`${API_URL}/profile`, {
      method: "PUT",
      headers: getHeaders(this.token),
      body: JSON.stringify(data),
    });
    return handleResp<Profile>(res);
  }

  async updatePassword(data: PasswordUpdate): Promise<Profile> {
    const res = await fetch(`${API_URL}/profile/password`, {
      method: "PUT",
      headers: getHeaders(this.token),
      body: JSON.stringify(data),
    });
    return handleResp<Profile>(res);
  }

  async getChessLevels(): Promise<ChessLevel[]> {
    const res = await fetch(`${API_URL}/admin/attribute/types`, {
      headers: getHeaders(this.token),
    });
    const data = await handleResp<{ data: ChessLevelType[] }>(res);
    
    // Find the chess level attribute type and return its values
    const chessLevelType = data.data.find(type => 
      type.name.toLowerCase().includes('chess') || 
      type.name.toLowerCase().includes('level') ||
      type.name.toLowerCase().includes('уровень')
    );
    
    return chessLevelType?.values || [];
  }
}

export const profileService = new ProfileService(); 