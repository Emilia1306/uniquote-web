export type Role = 'ADMIN' | 'GERENTE' | 'DIRECTOR';

export interface User {
  id: number | string;
  name: string;
  lastName: string;
  email: string;
  role: Role;
}
