// Регистрация
export interface RegisterRequest {
  email: string;
  chess_level_id: string;
  password: string;
}

// Логин (form-data)
export interface LoginRequest {
  grant_type: "password";
  username: string; // email
  password: string;
  scope?: string;
  client_id?: string;
  client_secret?: string;
}

// Ответы
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
}

export interface LogoutResponse {
  status: boolean;
  message: string;
}

// Уровни шахмат
export interface AttributeValue {
  value: string;
  id: string;
}

export interface AttributeType {
  name: string;
  id: string;
  values: AttributeValue[];
}

export interface AttributesResponse {
  data: AttributeType[];
  total: number;
}

// Пользователь
export interface User {
  id: string;
  email: string;
  chess_level_id: string;
  created_at: string;
  updated_at: string;
}

// Состояние авторизации
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: {
    access: string;
    refresh: string;
  } | null;
  chessLevels: AttributeValue[];
  user: User | null;
}
