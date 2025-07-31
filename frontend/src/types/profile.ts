export interface UserProfile {
  email: string;
  chess_level_id: string;
}

export interface UpdateProfileRequest {
  chess_level_id: string;
}

export interface UpdatePasswordRequest {
  password: string;
}
