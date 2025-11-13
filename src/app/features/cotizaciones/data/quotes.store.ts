import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type Quote = {
  id: string;
  cliente: string;
  estado: 'APROBADA'|'PENDIENTE'|'RECHAZADA';
  monto: number;
  fecha: string;   // ISO
  autor: string;
};
export type ViewMode = 'table'|'cards';

type Filter = {
  search: string;
  estado: 'ALL'|'APROBADA'|'PENDIENTE'|'RECHAZADA';
  sort: 'fecha_desc'|'fecha_asc'|'monto_desc'|'monto_asc';
};

const TTL_MS = 10 * 60 * 1000; // 10 min

@Injectable({ providedIn: 'root' })
export class QuotesStore {
  private _all = signal<Quote[]>([]);
  private _fetchedAt = signal<number | null>(null);

  viewMode = signal<ViewMode>('table');
  filter = signal<Filter>({ search: '', estado: 'ALL', sort: 'fecha_desc' });

  constructor(private http: HttpClient) {}

  rows = computed(() => this._all());

  filtered = computed(() => {
    let data = this._all();
    const { search, estado, sort } = this.filter();

    if (estado !== 'ALL') data = data.filter(r => r.estado === estado);
    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter(r =>
        r.id.toLowerCase().includes(s) ||
        r.cliente.toLowerCase().includes(s) ||
        r.autor.toLowerCase().includes(s)
      );
    }
    switch (sort) {
      case 'fecha_desc':  data = [...data].sort((a,b)=> +new Date(b.fecha) - +new Date(a.fecha)); break;
      case 'fecha_asc':   data = [...data].sort((a,b)=> +new Date(a.fecha) - +new Date(b.fecha)); break;
      case 'monto_desc':  data = [...data].sort((a,b)=> b.monto - a.monto); break;
      case 'monto_asc':   data = [...data].sort((a,b)=> a.monto - b.monto); break;
    }
    return data;
  });

  setView(mode: ViewMode) { this.viewMode.set(mode); }
  setFilter(patch: Partial<Filter>) { this.filter.set({ ...this.filter(), ...patch }); }

  async load(
    { scope = 'global' as 'global'|'mine', userId }: { scope?: 'global'|'mine'; userId?: string },
    { force = false } = {}
  ) {
    const now = Date.now();
    if (!force && this._fetchedAt() && now - (this._fetchedAt()!) < TTL_MS) return;

    // 🔗 Cuando tengas API real, descomenta y ajusta:
    // const url = scope === 'global' ? '/quotes' : `/quotes?autor=${encodeURIComponent(userId||'')}`;
    // const data = await this.http.get<Quote[]>(url, { withCredentials:true }).toPromise();

    // 🧪 MOCK temporal:
    const data: Quote[] = [
      { id:'C-1001', cliente:'Acme S.A.', estado:'APROBADA',  monto:1250, fecha:'2025-07-01', autor:'Juan' },
      { id:'C-1002', cliente:'Globex',    estado:'APROBADA', monto: 9850, fecha:'2025-07-02', autor:'Ana'  },
      { id:'C-1003', cliente:'Initech',   estado:'APROBADA', monto:1500, fecha:'2025-07-03', autor:'Luis' },
      { id:'C-1004', cliente:'Umbrella',  estado:'APROBADA',  monto: 1720, fecha:'2025-07-04', autor:'Ana'  },
    ];

    this._all.set(data ?? []);
    this._fetchedAt.set(now);
  }

  invalidate() { this._fetchedAt.set(0); }
}
