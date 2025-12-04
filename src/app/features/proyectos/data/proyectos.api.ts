import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

  http = inject(HttpClient);

  

  getByCliente(clienteId: number) {
    return this.http.get<Proyecto[]>(`/api/v1/projects?clienteId=${clienteId}`, {
      withCredentials: true,
    });
  }

  getOne(id: number) {
    return this.http.get(`/api/v1/projects/${id}`, { withCredentials: true });
  }
  create(data: {
      name: string;
      clienteId: number;
      contactoId?: number;
    }) {
      return this.http.post(`/api/v1/projects`, data, {
        withCredentials: true,
      });
    }
  
}
