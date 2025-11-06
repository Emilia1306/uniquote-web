export type Role = 'ADMIN' | 'GERENTE' | 'DIRECTOR';

export interface User {
  id: number | string;
  name: string;
  email: string;
  role: Role;
}
