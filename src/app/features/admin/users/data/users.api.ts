import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { User } from '../../../../core/models/user';
import { normalizeRole } from '../../../../core/auth/roles';

type ApiRole = { id: number; name: string };
type ApiUser = {
  id: number | string;
  name: string;
  lastName: string;
  email: string;
  phone?: string;
  role: ApiRole;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateUserDto = {
  name: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  roleId: number;
};

export type UpdateUserDto = Partial<Omit<CreateUserDto, 'password'>> & {
  password?: string;
};

// --- adaptador: API -> UI (tu modelo con role unión) ---
export function mapApiUser(u: ApiUser): User {
  return {
    id: u.id,
    name: u.name,
    lastName: u.lastName,
    email: u.email,
    role: normalizeRole(u.role?.name),
    phone: u.phone ?? undefined,
  };
}

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/users`;

  async list(): Promise<User[]> {
    const res = await this.http.get<ApiUser[]>(this.base).toPromise();
    return (res ?? []).map(mapApiUser);
  }

  async get(id: number | string): Promise<User> {
    const res = await this.http.get<ApiUser>(`${this.base}/${id}`).toPromise();
    if (!res) throw new Error('Usuario no encontrado');
    return mapApiUser(res);
  }

  async create(dto: CreateUserDto): Promise<User> {
    const res = await this.http.post<ApiUser>(this.base, dto).toPromise();
    if (!res) throw new Error('No se pudo crear el usuario');
    return mapApiUser(res);
  }

  async update(id: number | string, dto: UpdateUserDto): Promise<User> {
    const res = await this.http.put<ApiUser>(`${this.base}/${id}`, dto).toPromise();
    if (!res) throw new Error('No se pudo actualizar el usuario');
    return mapApiUser(res);
  }

  async remove(id: number | string): Promise<void> {
    await this.http.delete(`${this.base}/${id}`).toPromise();
  }

  async listRecent(limit = 5): Promise<User[]> {
    const res = await this.http.get<ApiUser[]>(this.base).toPromise();
    const sorted = (res ?? []).sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da; // descendente
    });
    return sorted.slice(0, limit).map(mapApiUser);
  }
}
