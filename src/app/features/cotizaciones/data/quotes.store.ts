import { Injectable, computed, signal, inject } from '@angular/core';
import { CotizacionesApi, Cotizacion } from './cotizaciones.api';

export type ViewMode = 'table'|'cards';

export interface CotizacionFilters {
  search: string;
  clienteId?: number;
  proyectoId?: number;
  contactoId?: number;
  directorId?: number;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class CotizacionesStore {

  private api = inject(CotizacionesApi);

  private _items = signal<Cotizacion[]>([]);
  private _loading = signal<boolean>(false);

  filters = signal<CotizacionFilters>({ search: '' });
  viewMode = signal<ViewMode>('table');

  // 👇 TIPADO explícito
  items = computed<Cotizacion[]>(() => this._items());
  loading = computed<boolean>(() => this._loading());

  filtered = computed<Cotizacion[]>(() => {
    const { search } = this.filters();
    let rows = this._items();

    if (search.trim()) {
      const s = search.toLowerCase();
      rows = rows.filter(r =>
        r.name.toLowerCase().includes(s) ||
        r.code.toLowerCase().includes(s) ||
        r.createdBy.name.toLowerCase().includes(s)
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

  setView(mode: ViewMode) {
    this.viewMode.set(mode);
  }
}
