import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface Proyecto {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;

  cliente: {
    id: number;
    empresa: string;
    razonSocial: string;
  };

  contacto?: {
    id: number;
    nombre: string;
    email: string;
  };

  _count?: {
    cotizaciones: number;
  };
}

@Injectable({ providedIn: 'root' })
export class ProyectosApi {

  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/projects`;

  getByCliente(clienteId: number) {
    return this.http.get<Proyecto[]>(`${this.base}?clienteId=${clienteId}`, {
      withCredentials: true,
    });
  }

  getOne(id: number) {
    return this.http.get<Proyecto>(`${this.base}/${id}`, {
      withCredentials: true,
    });
  }

  create(data: {
    name: string;
    clienteId: number;
    contactoId?: number;
  }) {
    return this.http.post(this.base, data, {
      withCredentials: true,
    });
  }
}
