// src/app/core/models/user.ts
import { Role } from '../auth/roles';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}
