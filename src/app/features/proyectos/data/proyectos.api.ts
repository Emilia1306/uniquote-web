import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Proyecto } from './proyectos.types';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProyectosApi {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/projects`;

  /** Obtener todos los proyectos */
  getAll() {
    return this.http.get<Proyecto[]>(`${this.base}/all`, {
      withCredentials: true,
    });
  }

  /** Obtener un proyecto por ID */
  getOne(id: number) {
    return this.http.get<Proyecto>(`${this.base}/${id}`, {
      withCredentials: true,
    });
  }

  /** Crear proyecto */
  create(data: { name: string; clienteId: number; contactoId?: number }) {
    return this.http.post<Proyecto>(this.base, data, {
      withCredentials: true,
    });
  }

  /** Editar proyecto */
  update(id: number, data: { name: string; clienteId: number; contactoId?: number }) {
    return this.http.put<Proyecto>(`${this.base}/${id}`, data, {
      withCredentials: true,
    });
  }


  /** Eliminar proyecto */
  delete(id: number) {
    return this.http.delete(`${this.base}/${id}`, {
      withCredentials: true,
    });
  }

  /** Listar proyectos por cliente */
  listByCliente(clienteId: number): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(`${this.base}?clienteId=${clienteId}`, {
      withCredentials: true,
    });
  }

  getByCliente(clienteId: number) {
    return this.http.get<Proyecto[]>(`${this.base}?clienteId=${clienteId}`, {
      withCredentials: true
    });
  }


}
