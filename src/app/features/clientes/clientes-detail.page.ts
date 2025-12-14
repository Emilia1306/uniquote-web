// src/app/features/clientes/clientes-detail.page.ts
import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ClientesApi, type Cliente } from './data/clientes.api';
import {
  ContactosApi,
  type ContactoEmpresa,
  type CreateContactoDto,
  type UpdateContactoDto,
} from './data/contactos.api';

type ViewMode = 'cards' | 'list';

function norm(s: string) {
  return (s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

import { AuthService } from '../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'cliente-detail-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './clientes-detail.page.html',
})
export class ClienteDetailPage {
  private route = inject(ActivatedRoute);
  private clientesApi = inject(ClientesApi);
  private contactosApi = inject(ContactosApi);
  public auth = inject(AuthService);

  loading = signal(false);
  error = signal<string | null>(null);
  cliente = signal<Cliente | null>(null);
  contactos = signal<ContactoEmpresa[]>([]);

  view = signal<ViewMode>((localStorage.getItem('cliente-detail-view') as ViewMode) || 'cards');
  private _qRaw = signal('');
  q = signal('');
  private _debTimer: any = null;

  setQRaw(v: string) {
    this._qRaw.set(v);
    clearTimeout(this._debTimer);
    this._debTimer = setTimeout(() => this.q.set(v.trim()), 250);
  }
  qRaw = computed(() => this._qRaw());

  filtered = computed(() => {
    const q = norm(this.q());
    if (!q) return this.contactos();
    return this.contactos().filter(c =>
      norm(`${c.nombre} ${c.email} ${c.telefono}`).includes(q)
    );
  });

  showForm = signal(false);
  editingId = signal<number | null>(null);
  f = { nombre: '', email: '', telefono: '' };

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || Number.isNaN(id)) { this.error.set('ID inválido'); return; }
    await this.load(id);
  }

  async load(id: number) {
    this.loading.set(true); this.error.set(null);
    try {
      const c = await this.clientesApi.getById(id);
      const cons = await this.contactosApi.listByCliente(id);
      this.cliente.set(c);
      this.contactos.set(cons ?? []);
    } catch (e: any) {
      this.error.set(e?.message ?? 'No se pudo cargar la página del cliente');
    } finally {
      this.loading.set(false);
    }
  }

  setView(v: ViewMode) {
    this.view.set(v);
    localStorage.setItem('cliente-detail-view', v);
  }
  totalMostrados = computed(() => this.filtered().length);

  openCreate() {
    this.editingId.set(null);
    this.f = { nombre: '', email: '', telefono: '' };
    this.showForm.set(true);
  }

  openEdit(c: ContactoEmpresa) {
    this.editingId.set(c.id as number);
    this.f = { nombre: c.nombre, email: c.email, telefono: c.telefono };
    this.showForm.set(true);
  }

  cancelForm() { this.showForm.set(false); this.editingId.set(null); }

  async submit() {
    const cli = this.cliente(); if (!cli) return;
    this.loading.set(true); this.error.set(null);
    try {
      if (this.editingId()) {
        const dto: UpdateContactoDto = { ...this.f };
        const updated = await this.contactosApi.update(this.editingId()!, dto);
        this.contactos.set(this.contactos().map(x => x.id === updated.id ? updated : x));
      } else {
        const dto: CreateContactoDto = { clienteId: cli.id as number, ...this.f };
        const created = await this.contactosApi.create(dto);
        this.contactos.set([created, ...this.contactos()]);
      }
      this.cancelForm();
    } catch (e: any) {
      this.error.set(e?.message ?? 'No se pudo guardar el contacto');
    } finally {
      this.loading.set(false);
    }
  }

  async remove(c: ContactoEmpresa) {
    if (!confirm(`¿Eliminar a "${c.nombre}"?`)) return;
    this.loading.set(true); this.error.set(null);
    try {
      await this.contactosApi.remove(c.id as number);
      this.contactos.set(this.contactos().filter(x => x.id !== c.id));
    } catch (e: any) {
      this.error.set(e?.message ?? 'No se pudo eliminar el contacto');
    } finally {
      this.loading.set(false);
    }
  }

  // --- cerrar modal con ESC (sin parámetro para evitar el error de tipos) ---
  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.showForm()) this.cancelForm();
  }

  // --- cerrar modal click fuera ---
  onOverlayClick(e: MouseEvent) {
    const target = e.target as HTMLElement | null;
    if (target?.dataset['overlay'] === 'true') this.cancelForm();
  }
}
