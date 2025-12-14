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

    // Filtro por "Mis Cotizaciones"
    if (mineOnly) {
      const myId = this.auth.user()?.id;
      if (myId) {
        rows = rows.filter(r => r.createdBy?.id === myId);
      }
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      rows = rows.filter(r =>
        r.name.toLowerCase().includes(s) ||
        r.code.toLowerCase().includes(s) ||
        r.createdBy.name.toLowerCase().includes(s) ||
        r.createdBy.lastName.toLowerCase().includes(s) ||
        r.contacto?.nombre?.toLowerCase().includes(s) ||
        r.contacto?.email?.toLowerCase().includes(s) ||
        r.project?.name?.toLowerCase().includes(s) ||
        r.project?.cliente?.empresa?.toLowerCase().includes(s)
      );
    }

    return rows;
  });

  async loadByProject(projectId: number) {
    this._loading.set(true);
    const res = await this.api.getByProject(projectId).toPromise();
    this._items.set(res ?? []);
    this._loading.set(false);
  }

  async loadGlobal(params: any = {}) {
    this._loading.set(true);
    const res = await this.api.getAllFiltered(params).toPromise();
    this._items.set(res ?? []);
    this._loading.set(false);
  }

  setFilters(patch: Partial<CotizacionFilters>) {
    this.filters.set({
      ...this.filters(),
      ...patch
    });
  }

  setViewMode(mode: ViewMode) {
    this.viewMode.set(mode);
    localStorage.setItem('quotes-view-mode', mode);
  }
}
