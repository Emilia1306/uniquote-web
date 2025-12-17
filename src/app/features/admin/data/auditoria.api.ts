import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ClientesApi } from '../../clientes/data/clientes.api';

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
    private clientesApi = inject(ClientesApi);
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

        try {
            const res = await this.http.get<any>(this.base, { params: q }).toPromise();

            let result: AuditListResponse = { data: [], meta: { total: 0, page, lastPage: 1 } };

            if (!res) {
                result = { data: [], meta: { total: 0, page, lastPage: 1 } };
            } else if (Array.isArray(res)) {
                result = {
                    data: res,
                    meta: { total: res.length, page, lastPage: res.length < limit ? page : page + 1 }
                };
            } else if (res.data && Array.isArray(res.data)) {
                result = {
                    data: res.data,
                    meta: res.meta || { total: res.data.length, page, lastPage: 1 }
                };
            }

            // Enriquecer con nombres de clientes
            if (result.data.length > 0) {
                result.data = await this.enrichLogs(result.data);
            }

            return result;

        } catch (err) {
            console.error('Audit API Error', err);
            return { data: [], meta: { total: 0, page: 1, lastPage: 1 } };
        }
    }

    /**
     * Obtener últimos logs (para dashboard)
     */
    async listRecent(limit = 5): Promise<LogAuditoria[]> {
        const res = await this.list({ page: 1, limit });
        return res.data;
    }

    private async enrichLogs(logs: LogAuditoria[]): Promise<LogAuditoria[]> {
        const idsToFetch = new Set<string>();

        // 1. Identificar IDs
        for (const log of logs) {
            console.log('AUDIT RAW DESC:', log.descripcion);
            const regex = /clientId\s*=\s*(\d+)/gi;
            let match;
            while ((match = regex.exec(log.descripcion)) !== null) {
                console.log('MATCH FOUND:', match[1]);
                idsToFetch.add(match[1]);
            }
        }

        console.log('AUDIT DEBUG: IDs encontrados:', [...idsToFetch]);

        if (idsToFetch.size === 0) return logs;

        // 2. Resolver nombres
        const namesMap = new Map<string, string>();

        try {
            await Promise.all(Array.from(idsToFetch).map(async (id) => {
                try {
                    const client = await this.clientesApi.getById(id);
                    if (client) {
                        const name = client.empresa || client.razonSocial || `Cliente #${id}`;
                        namesMap.set(String(id), name);
                    }
                } catch (e) {
                    console.warn(`No se pudo resolver cliente ${id}`, e);
                }
            }));
        } catch (err) {
            console.error('Error resolviendo clientes', err);
        }

        console.log('AUDIT DEBUG: Map de nombres:', [...namesMap.entries()]);

        // 3. Reemplazar
        return logs.map(log => {
            let newDesc = log.descripcion;
            const replaceRegex = /clientId\s*=\s*(\d+)/gi;
            newDesc = newDesc.replace(replaceRegex, (match, id) => {
                const name = namesMap.get(id);
                return name ? `${name}` : match;
            });
            return { ...log, descripcion: newDesc };
        });
    }
}
