import { UserRole } from '../constants/enums';

export interface UserPayload {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserPayload;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}
