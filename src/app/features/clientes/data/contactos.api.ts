// src/app/features/clientes/data/contactos.api.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface ContactoEmpresa {
  id: number;
  clienteId: number;
  nombre: string;
  email: string;
  telefono: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateContactoDto {
  clienteId: number;
  nombre: string;
  email: string;
  telefono: string;
}
export interface UpdateContactoDto {
  clienteId?: number;
  nombre?: string;
  email?: string;
  telefono?: string;
}

@Injectable({ providedIn: 'root' })
export class ContactosApi {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/contactos`;

  async listByCliente(clienteId: number): Promise<ContactoEmpresa[]> {
    const res = await this.http
      .get<ContactoEmpresa[]>(`${this.base}?clienteId=${clienteId}`)
      .toPromise();
    return res ?? [];
  }

  async create(dto: CreateContactoDto): Promise<ContactoEmpresa> {
    const res = await this.http
      .post<ContactoEmpresa>(this.base, dto)
      .toPromise();
    if (!res) throw new Error('No se pudo crear el contacto');
    return res;
  }

  async update(id: number, dto: UpdateContactoDto): Promise<ContactoEmpresa> {
    const res = await this.http
      .put<ContactoEmpresa>(`${this.base}/${id}`, dto)
      .toPromise();
    if (!res) throw new Error('No se pudo actualizar el contacto');
    return res;
  }

  async remove(id: number): Promise<void> {
    await this.http.delete(`${this.base}/${id}`).toPromise();
  }
}
