import { User } from './user';

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string; 
  user: User;
}
