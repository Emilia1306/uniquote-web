import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Cotizacion {
  id: number;
  code: string;
  name: string;
  status: string;

  totalEntrevistas: number;
  totalCobrar: number | null;
  costoPorEntrevista: number | null;

  createdAt: string;

  contacto?: {
    id: number;
    nombre: string;
    email: string;
  };

  createdBy: {
    id: number;
    name: string;
    lastName: string;
  };
}

@Injectable({ providedIn: 'root' })
export class CotizacionesApi {

  http = inject(HttpClient);

  getByProject(projectId: number) {
    return this.http.get<Cotizacion[]>(
      `/api/v1/cotizaciones?projectId=${projectId}`,
      { withCredentials: true }
    );
  }

  getAllFiltered(params: any) {
    return this.http.get<Cotizacion[]>(`/api/v1/cotizaciones-global`, {
      params,
      withCredentials: true
    });
  }

  getOne(id: number) {
    return this.http.get(`/api/v1/cotizaciones/${id}`, {
      withCredentials: true
    });
  }

  getById(id: number) {
    return this.http.get<any>(`/api/v1/cotizaciones/${id}`, {
      withCredentials: true
    });
  }

  create(body: any) {
    return this.http.post<{ id: number }>(`/api/v1/cotizaciones`, body, {
      withCredentials: true
    });
  }


  update(id: number, body: any) {
    return this.http.patch(`/api/v1/cotizaciones/${id}`, body, {
      withCredentials: true
    });
  }

  updateStatus(id: number, body: any) {
    return this.http.patch(`/api/v1/cotizaciones/${id}/status`, body, {
      withCredentials: true
    });
  }

  clone(id: number) {
    return this.http.post<{ id: number }>(
      `/api/v1/cotizaciones/${id}/clone`,
      {},
      { withCredentials: true }
    );
  }

  delete(id: number) {
    return this.http.delete(`/api/v1/cotizaciones/${id}`, {
      withCredentials: true
    });
  }
}
