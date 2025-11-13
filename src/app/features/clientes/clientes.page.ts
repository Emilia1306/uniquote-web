import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { Cliente } from '../../core/models/cliente';
import { ClientesApi } from './data/clientes.api';

function norm(s: string) {
  return (s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

type ViewMode = 'cards' | 'list';

@Component({
  standalone: true,
  selector: 'clientes-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.page.html',
})
export class ClientesPage {
  private api = inject(ClientesApi);

  // datos
  loading  = signal(false);
  error    = signal<string | null>(null);
  clientes = signal<Cliente[]>([]);

  // -------- Filtros en memoria ----------
  private _qRaw = signal('');           // interno (lo editas desde el input)
  public  qRaw  = this._qRaw;           // alias público para el template
  q = signal('');                       // valor debounced
  view = signal<ViewMode>('cards');     // toggle lista/cards

  // debounce
  private t: any = null;
  onSearchChange(v: string) {
    this._qRaw.set(v);
    clearTimeout(this.t);
    this.t = setTimeout(() => this.q.set(v.trim()), 250);
  }

  setQRaw(v: string) {
    this.qRaw.set(v);         // actualiza la señal visible
    this.onSearchChange(v);   // aplica debounce y filtra
  }

  filtered = computed(() => {
    const q = norm(this.q());
    if (!q) return this.clientes();
    return this.clientes().filter(c =>
      norm(`${c.empresa} ${c.razonSocial}`).includes(q)
    );
  });

  // -------- Modal crear/editar ----------
  showForm  = signal(false);
  editingId = signal<number | string | null>(null);
  f = { empresa: '', razonSocial: '' };

  async ngOnInit() { await this.load(); }

  async load(force = false) {
    this.loading.set(true);
    this.error.set(null);
    try {
      if (force) this.api.clearCache();
      // pide lista (auto decide cliente/servidor), toma solo items
      const res = await this.api.list({ sort: 'empresa_asc', page: 1, pageSize: 50 }, 'auto');
      this.clientes.set(res.items);
    } catch (e: any) {
      this.error.set(e?.message ?? 'No se pudieron cargar los clientes');
    } finally {
      this.loading.set(false);
    }
  }

  // UI helpers
  setView(v: ViewMode) { this.view.set(v); }
  totalMostrados = computed(() => this.filtered().length);

  // -------- CRUD ----------
  openCreate() {
    this.editingId.set(null);
    this.f = { empresa: '', razonSocial: '' };
    this.showForm.set(true);
  }
  openEdit(c: Cliente) {
    this.editingId.set(c.id);
    this.f = { empresa: c.empresa, razonSocial: c.razonSocial };
    this.showForm.set(true);
  }
  cancelForm() { this.showForm.set(false); this.editingId.set(null); }

  async submit() {
    this.loading.set(true);
    this.error.set(null);
    try {
      if (this.editingId()) {
        const updated = await this.api.update(this.editingId()!, { ...this.f });
        this.clientes.set(this.clientes().map(x => x.id === updated.id ? updated : x));
      } else {
        const created = await this.api.create({ ...this.f });
        this.clientes.set([created, ...this.clientes()]);
      }
      this.cancelForm();
    } catch (e: any) {
      this.error.set(e?.message ?? 'No se pudo guardar el cliente');
    } finally {
      this.loading.set(false);
    }
  }

  async remove(c: Cliente) {
    if (!confirm(`¿Eliminar "${c.empresa}"?`)) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.api.remove(c.id);
      this.clientes.set(this.clientes().filter(x => x.id !== c.id));
    } catch (e: any) {
      this.error.set(e?.message ?? 'No se pudo eliminar');
    } finally {
      this.loading.set(false);
    }
  }
}
