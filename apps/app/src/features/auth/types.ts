export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  loading: boolean;
  error: string | null;
  accessToken: string | null;
  user: AuthUser | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
}
