import { Injectable, computed, signal, inject } from '@angular/core';
import { CotizacionesApi, Cotizacion } from './cotizaciones.api';

import { AuthService } from '../../../core/auth/auth.service';

export type ViewMode = 'table' | 'cards';

export interface CotizacionFilters {
  search: string;
  mineOnly?: boolean;
  clienteId?: number;
  proyectoId?: number;
  contactoId?: number;
  directorId?: number;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class CotizacionesStore {

  private api = inject(CotizacionesApi);
  private auth = inject(AuthService);

  private _items = signal<Cotizacion[]>([]);
  private _loading = signal<boolean>(false);

  filters = signal<CotizacionFilters>({ search: '' });
  viewMode = signal<ViewMode>(
    (localStorage.getItem('quotes-view-mode') as ViewMode) || 'table'
  );

  // 👇 TIPADO explícito
  items = computed<Cotizacion[]>(() => this._items());
  loading = computed<boolean>(() => this._loading());

  filtered = computed<Cotizacion[]>(() => {
    const { search, mineOnly } = this.filters();
    let rows = this._items();

    // ------------------------------------------------------------------
    // VISIBILIDAD POR ROL
    // ------------------------------------------------------------------
    // Reglas:
    // 1. ADMIN: Ve todo.
    // 2. GERENTE / DIRECTOR: Ve 'APROBADO' de todos + SUYAS (todas).
    // 3. (Implícito) Otros: Solo verían suyas si aplicamos filtro estricto, 
    //    pero la lógica aquí abajo maneja la mezcla.

    const role = this.auth.role();
    const myId = this.auth.user()?.id;

    if (role !== 'ADMIN') {
      rows = rows.filter(r => {
        const isMine = r.createdBy?.id === myId;
        const isApproved = r.status === 'APROBADO';

        // Si activó "Mis cotizaciones", forzamos solo suyas
        if (mineOnly) {
          return true;
        }

        // Si no, ve Aprobadas (globales)
        return isApproved;
      });
    } else {
      // ADMIN: Solo aplicamos "Mis cotizaciones" si lo activara (aunque UI lo oculta)
      if (mineOnly && myId) {
        rows = rows.filter(r => r.createdBy?.id === myId);
      }
    }

    // ------------------------------------------------------------------
    // FILTROS UI (Status, Contacto, Search)
    // ------------------------------------------------------------------

    // Filtro por Contacto
    if (this.filters().contactoId) {
      rows = rows.filter(r => r.contacto?.id === this.filters().contactoId);
    }

    // Filtro por Cliente
    if (this.filters().clienteId) {
      rows = rows.filter(r => r.project?.cliente?.id === this.filters().clienteId);
    }

    // Filtro por Estado (Dropdown específico de Admin o Mi Tab)
    if (this.filters().status) {
      const isMyTab = this.filters().mineOnly;
      if (role === 'ADMIN' || isMyTab) {
        rows = rows.filter(r => r.status === this.filters().status);
      }
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      rows = rows.filter(r =>
        (r.name || '').toLowerCase().includes(s) ||
        (r.code || '').toLowerCase().includes(s) ||
        (r.createdBy?.name || '').toLowerCase().includes(s) ||
        (r.createdBy?.lastName || '').toLowerCase().includes(s) ||
        (r.contacto?.nombre || '').toLowerCase().includes(s) ||
        (r.contacto?.email || '').toLowerCase().includes(s) ||
        (r.project?.name || '').toLowerCase().includes(s) ||
        (r.project?.cliente?.empresa || '').toLowerCase().includes(s)
      );
    }

    return rows;
  });

  // PAGINATION
  page = signal<number>(1);
  pageSize = signal<number>(10);

  paginatedItems = computed(() => {
    const p = this.page();
    const size = this.pageSize();
    const all = this.filtered();
    const start = (p - 1) * size;
    return all.slice(start, start + size);
  });

  totalPages = computed(() => {
    const total = this.filtered().length;
    const size = this.pageSize();
    return total === 0 ? 1 : Math.ceil(total / size);
  });

  setPage(p: number) {
    this.page.set(p);
  }


  async loadByProject(projectId: number) {
    this._loading.set(true);
    const res = await this.api.getByProject(projectId).toPromise();
    this._items.set(res ?? []);
    this._loading.set(false);
  }

  async loadGlobal(params: any = {}) {
    this._loading.set(true);
    const mineOnly = this.filters().mineOnly;
    try {
      let res;
      if (mineOnly) {
        res = await this.api.getMine().toPromise();
      } else {
        // Si es Admin, podemos pasar un limite alto para asegurarnos de traer "todas"
        const isAdmin = this.auth.role() === 'ADMIN';
        const finalParams = isAdmin ? { limit: 1000, ...params } : params;
        res = await this.api.getAllFiltered(finalParams).toPromise();
      }
      this._items.set(res ?? []);
    } catch (err) {
      console.error('Error loading quotes', err);
      this._items.set([]);
    } finally {
      this._loading.set(false);
    }
  }

  setFilters(patch: Partial<CotizacionFilters>) {
    const oldMine = this.filters().mineOnly;

    // Update filters
    this.filters.set({
      ...this.filters(),
      ...patch
    });

    // Reset pagination
    this.page.set(1);

    // If 'mineOnly' changed, reload data
    if (patch.mineOnly !== undefined && patch.mineOnly !== oldMine) {
      this.loadGlobal();
    }
  }

  setViewMode(mode: ViewMode) {
    this.viewMode.set(mode);
    localStorage.setItem('quotes-view-mode', mode);
  }

  async cloneQuote(id: number) {
    return this.api.clone(id).toPromise();
  }

  async updateStatus(id: number, status: string) {
    await this.api.updateStatus(id, { status }).toPromise();
    // Update local state
    this._items.update(items =>
      items.map(i => i.id === id ? { ...i, status } : i)
    );
  }
}
