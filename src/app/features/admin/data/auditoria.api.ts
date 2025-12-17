import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface LogAuditoria {
    id: number;
    accion: string;
    descripcion: string;
    entidad: string;
    entidadId: number;
    performedBy?: {
        id: number;
        name: string;
        lastName: string;
        email: string;
    };
    createdAt: string;
    metadata?: any;
}

export interface AuditListResponse {
    data: LogAuditoria[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
    };
}

@Injectable({ providedIn: 'root' })
export class AuditoriaApi {
    private http = inject(HttpClient);
    // Asumiendo que el endpoint base es /auditoria
    private base = `${environment.apiUrl}/auditoria`;

    /**
     * Listar logs con paginación
     */
    async list(params: { page?: number; limit?: number; search?: string } = {}): Promise<AuditListResponse> {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;

        let q = new HttpParams()
            .set('skip', skip)
            .set('take', limit);

        // Si el backend soporta busqueda por entidad o algo similar, se puede mapear aqui.
        // Por ahora solo mandamos skip/take como pide el endpoint.

        return this.http.get<any>(this.base, { params: q }).toPromise()
            .then(res => {
                if (!res) {
                    return { data: [], meta: { total: 0, page, lastPage: 1 } };
                }

                // Caso 1: Array directo
                if (Array.isArray(res)) {
                    return {
                        data: res,
                        meta: { total: res.length, page, lastPage: res.length < limit ? page : page + 1 }
                    };
                }

                // Caso 2: Objeto paginado standard { data, meta } o { items, count }
                if (res.data && Array.isArray(res.data)) {
                    return {
                        data: res.data,
                        meta: res.meta || { total: res.data.length, page, lastPage: 1 }
                    };
                }

                return { data: [], meta: { total: 0, page: 1, lastPage: 1 } };
            })
            .catch(err => {
                console.error('Audit API Error', err);
                return { data: [], meta: { total: 0, page: 1, lastPage: 1 } };
            });
    }

    /**
     * Obtener últimos logs (para dashboard)
     */
    async listRecent(limit = 5): Promise<LogAuditoria[]> {
        const res = await this.list({ page: 1, limit });
        return res.data;
    }
}
