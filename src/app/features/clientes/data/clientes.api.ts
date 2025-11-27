import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface Cliente {
  id: number | string;
  empresa: string;
  razonSocial: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClienteDto {
  empresa: string;
  razonSocial: string;
}
export interface UpdateClienteDto {
  empresa?: string;
  razonSocial?: string;
}

export type SortKey = 'empresa_asc' | 'recent';

export interface ListOptions {
  q?: string;         // filtro por empresa (texto)
  page?: number;      // 1..N
  pageSize?: number;  // 10, 20, 50...
  sort?: SortKey;     // empresa_asc | recent
}

export interface ListResponse<T> {
  items: T[];
  total: number;
}

/** Umbral para trabajar 100% en memoria. */
const LOCAL_LIMIT = 300;

function normalize(s: string) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

type Strategy = 'auto' | 'client' | 'server';

@Injectable({ providedIn: 'root' })
export class ClientesApi {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/clientes`;

  /** Cache de “todos” (para modo cliente). */
  private cacheAll: Cliente[] | null = null;

  /** Cache por query-string (para modo servidor). */
  private pageCache = new Map<string, ListResponse<Cliente>>();

  /** Construye una clave de cache para las opciones. */
  private key(opts?: ListOptions) {
    const o = {
      q: opts?.q ?? '',
      page: opts?.page ?? 1,
      pageSize: opts?.pageSize ?? 20,
      sort: opts?.sort ?? 'empresa_asc',
    };
    return JSON.stringify(o);
  }

  /** Decide modo cliente o servidor y devuelve items paginados. */
  async list(opts: ListOptions = {}, strategy: Strategy = 'auto'): Promise<ListResponse<Cliente>> {
    const key = this.key(opts);

    // Evita el estrechamiento problemático de TS
    const mode: Strategy = strategy;
    const isClient = mode === 'client';

    // 1) CLIENTE PURO (si hay cacheAll y es “pequeño”, o si lo fuerzas)
    if (isClient || (mode === 'auto' && this.cacheAll && this.cacheAll.length <= LOCAL_LIMIT)) {
      return this.applyClientOps(this.cacheAll ?? [], opts);
    }

    // 2) Si no hay cacheAll y el modo es AUTO, intentamos llenarla 1 vez
    if (mode === 'auto' && !this.cacheAll) {
      const all = await this.http.get<Cliente[]>(this.base).toPromise();
      this.cacheAll = all ?? [];
      if (this.cacheAll.length <= LOCAL_LIMIT) {
        return this.applyClientOps(this.cacheAll, opts);
      }
      // Si supera el límite, seguimos con modo servidor.
    }

    // 3) SERVIDOR: usa cache por página y query
    if (!isClient) {
      if (this.pageCache.has(key)) return this.pageCache.get(key)!;

      const params: any = {};
      if (opts.q)        params.q = opts.q;
      if (opts.page)     params.page = String(opts.page);
      if (opts.pageSize) params.pageSize = String(opts.pageSize);
      if (opts.sort)     params.sort = opts.sort;

      // Cuando tu API soporte estos query params, esto funciona tal cual.
      const resp = await this.http.get<ListResponse<Cliente>>(this.base, { params }).toPromise();
      const result: ListResponse<Cliente> = resp ?? { items: [], total: 0 };
      this.pageCache.set(key, result);
      return result;
    }

    // 4) Fallback: cliente con cacheAll
    return this.applyClientOps(this.cacheAll ?? [], opts);
  }

  /** Crea y limpia/invalida caches. */
  async create(dto: CreateClienteDto): Promise<Cliente> {
    const created = await this.http.post<Cliente>(this.base, dto).toPromise();
    if (created) {
      if (this.cacheAll) this.cacheAll = [created, ...this.cacheAll];
      this.pageCache.clear();
    }
    return created!;
  }

  /** Actualiza y limpia cache correspondiente. */
  async update(id: number | string, dto: UpdateClienteDto): Promise<Cliente> {
    const updated = await this.http.put<Cliente>(`${this.base}/${id}`, dto).toPromise();
    if (updated) {
      if (this.cacheAll) this.cacheAll = this.cacheAll.map(c => (c.id === id ? updated : c));
      this.pageCache.clear();
    }
    return updated!;
  }

  /** Elimina y limpia caches. */
  async remove(id: number | string): Promise<void> {
    await this.http.delete(`${this.base}/${id}`).toPromise();
    if (this.cacheAll) this.cacheAll = this.cacheAll.filter(c => c.id !== id);
    this.pageCache.clear();
  }

  clearCache() {
    this.cacheAll = null;
    this.pageCache.clear();
  }


  /** Aplica búsqueda, ordenamiento y paginación en memoria. */
  private applyClientOps(data: Cliente[], opts?: ListOptions): ListResponse<Cliente> {
    const q = normalize(opts?.q ?? '');
    const sort = opts?.sort ?? 'empresa_asc';
    const page = Math.max(1, opts?.page ?? 1);
    const pageSize = Math.max(1, opts?.pageSize ?? 20);

    let arr = data;

    // Filtro por empresa (texto)
    if (q) {
      arr = arr.filter(c => normalize(c.empresa).includes(q));
    }

    // Orden
    if (sort === 'empresa_asc') {
      arr = [...arr].sort((a, b) => normalize(a.empresa).localeCompare(normalize(b.empresa)));
    } else {
      // recent -> createdAt desc (si existe)
      arr = [...arr].sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime()
      );
    }

    const total = arr.length;
    const start = (page - 1) * pageSize;
    const end   = start + pageSize;
    const items = arr.slice(start, end);

    return { items, total };
  }

  async getById(id: number | string) {
    // intenta cache local primero
    if (this.cacheAll) {
      const hit = this.cacheAll.find(c => String(c.id) === String(id));
      if (hit) return hit;
    }
    // llamado directo al endpoint /clientes/{id}
    const res = await this.http.get<Cliente>(`${this.base}/${id}`).toPromise();
    if (!res) throw new Error('No se pudo obtener el cliente');
    return res;
  }
}
