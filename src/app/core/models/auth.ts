import { User } from './user';

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string; // <-- el JWT
  user: User;
}
