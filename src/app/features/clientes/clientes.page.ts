// src/app/features/clientes/clientes.page.ts
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import type { Cliente } from '../../core/models/cliente';
import { ClientesApi } from './data/clientes.api';

function norm(s: string) {
  return (s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}
type ViewMode = 'cards' | 'list';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'clientes-page',
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './clientes.page.html',
})
export class ClientesPage {
  private api = inject(ClientesApi);
  public auth = inject(AuthService);

  loading = signal(false);
  error = signal<string | null>(null);
  clientes = signal<Cliente[]>([]);

  private _qRaw = signal('');
  public qRaw = this._qRaw;
  q = signal('');
  view = signal<ViewMode>((localStorage.getItem('clientes-view') as ViewMode) || 'cards');

  private t: any = null;
  onSearchChange(v: string) {
    this._qRaw.set(v);
    clearTimeout(this.t);
    this.t = setTimeout(() => this.q.set(v.trim()), 250);
  }
  setQRaw(v: string) { this.qRaw.set(v); this.onSearchChange(v); }

  filtered = computed(() => {
    const q = norm(this.q());
    if (!q) return this.clientes();
    return this.clientes().filter(c => norm(`${c.empresa} ${c.razonSocial}`).includes(q));
  });

  showForm = signal(false);
  editingId = signal<number | string | null>(null);
  f = { empresa: '', razonSocial: '' };

  async ngOnInit() { await this.load(); }

  async load(force = false) {
    this.loading.set(true); this.error.set(null);
    try {
      if (force) this.api.clearCache();
      const res = await this.api.list({ sort: 'empresa_asc', page: 1, pageSize: 50 }, 'auto');
      this.clientes.set(res.items);
    } catch (e: any) {
      this.error.set(e?.message ?? 'No se pudieron cargar los clientes');
    } finally {
      this.loading.set(false);
    }
  }

  setView(v: ViewMode) {
    this.view.set(v);
    localStorage.setItem('clientes-view', v);
  }
  totalMostrados = computed(() => this.filtered().length);

  openCreate() { this.editingId.set(null); this.f = { empresa: '', razonSocial: '' }; this.showForm.set(true); }
  openEdit(c: Cliente) { this.editingId.set(c.id); this.f = { empresa: c.empresa, razonSocial: c.razonSocial }; this.showForm.set(true); }
  cancelForm() { this.showForm.set(false); this.editingId.set(null); }

  async submit() {
    this.loading.set(true); this.error.set(null);
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
    this.loading.set(true); this.error.set(null);
    try {
      await this.api.remove(c.id);
      this.clientes.set(this.clientes().filter(x => x.id !== c.id));
    } catch (e: any) {
      this.error.set(e?.message ?? 'No se pudo eliminar');
    } finally {
      this.loading.set(false);
    }
  }

  // demo KPIs

}
