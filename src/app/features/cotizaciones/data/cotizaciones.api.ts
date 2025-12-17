import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface Cotizacion {
  id: number;
  code: string;
  name: string;
  status: string;

  totalEntrevistas: number;
  totalCobrar: number | null;
  costoPorEntrevista: number | null;

  createdAt: string;

  studyType?: string;
  metodologia?: string;

  contacto?: {
    id: number;
    nombre: string;
    email: string;
  };

  project?: {
    id: number;
    name: string;
    cliente: {
      id: number;
      empresa: string;
      razonSocial: string;
    };
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

  // 👇 BASE CORRECTA
  base = `${environment.apiUrl}/cotizaciones`;

  getByProject(projectId: number) {
    return this.http.get<Cotizacion[]>(
      `${this.base}?projectId=${projectId}`,
      { withCredentials: true }
    );
  }

  getAllFiltered(params: any) {
    return this.http.get<Cotizacion[]>(`${this.base}/all`, {
      withCredentials: true
    });
  }

  getMine() {
    return this.http.get<Cotizacion[]>(`${this.base}/mine`, {
      withCredentials: true
    });
  }

  getOne(id: number) {
    return this.http.get(`${this.base}/${id}`, {
      withCredentials: true
    });
  }

  getById(id: number) {
    return this.http.get<any>(`${this.base}/${id}`, {
      withCredentials: true
    });
  }

  create(body: any) {
    return this.http.post<{ id: number }>(this.base, body, {
      withCredentials: true
    });
  }

  update(id: number, body: any) {
    return this.http.patch(`${this.base}/${id}`, body, {
      withCredentials: true
    });
  }

  updateItem(id: number, itemId: number, body: any) {
    return this.http.patch(`${this.base}/${id}/items/${itemId}`, body, {
      withCredentials: true
    });
  }

  updateStatus(id: number, body: any) {
    return this.http.patch(`${this.base}/${id}/status`, body, {
      withCredentials: true
    });
  }

  clone(id: number) {
    return this.http.post<{ id: number }>(`${this.base}/${id}/clone`, {}, {
      withCredentials: true
    });
  }

  delete(id: number) {
    return this.http.delete(`${this.base}/${id}`, {
      withCredentials: true
    });
  }

  // --------------------------------------------------------------------------
  // STATS
  // --------------------------------------------------------------------------
  getStatsTotal() {
    return this.http.get<{ total: number }>(`${this.base}/stats/total`, {
      withCredentials: true
    });
  }

  getStatsPendientes() {
    return this.http.get<{ status: string, total: number }>(`${this.base}/stats/pendientes`, {
      withCredentials: true
    });
  }

  getStatsAprobadas() {
    return this.http.get<{ status: string, total: number }>(`${this.base}/stats/aprobadas`, {
      withCredentials: true
    });
  }

  getStatsNoAprobadas() {
    return this.http.get<{ status: string, total: number }>(`${this.base}/stats/no-aprobadas`, {
      withCredentials: true
    });
  }

  getStatsUltimos6Meses() {
    return this.http.get<Array<{ month: string, total: number, aprobadas: number, noAprobadas: number }>>(
      `${this.base}/stats/ultimos-6-meses`,
      { withCredentials: true }
    );
  }

  getStatsActividadSemanal(weekOffset = 0) {
    return this.http.get<{ weekOffset: number, days: Array<{ day: string, date: string, total: number }> }>(
      `${this.base}/stats/actividad-semanal?weekOffset=${weekOffset}`,
      { withCredentials: true }
    );
  }
}
