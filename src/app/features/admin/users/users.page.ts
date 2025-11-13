import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersApi, CreateUserDto, UpdateUserDto } from './data/users.api';
import type { User } from '../../../core/models/user';
import type { Role } from '../../../core/auth/roles';

function normalizeTxt(s: string) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

@Component({
  standalone: true,
  selector: 'admin-users-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './users.page.html',
})
export class AdminUsersPage {
  private api = inject(UsersApi);

  loading = signal(false);
  error = signal<string | null>(null);
  users = signal<User[]>([]);

  // ------------ Filtros (cliente) ------------
  public _searchRaw = signal('');              // input inmediato
  search = signal('');                          // texto ya con debounce
  roleFilter = signal<Role | 'ALL'>('ALL');     // selector de rol

  // debouncing simple
  private searchTimer: any = null;
  onSearchChange(v: string) {
    this._searchRaw.set(v);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.search.set(v.trim()), 250);
  }
  onRoleChange(v: string) {
    this.roleFilter.set(v as any);
  }

  // lista filtrada (no llama API, deriva de signals en memoria)
  filtered = computed(() => {
    const q = normalizeTxt(this.search());
    const rf = this.roleFilter();
    return this.users().filter(u => {
      const byRole = rf === 'ALL' ? true : u.role === rf;
      if (!q) return byRole;
      const blob = normalizeTxt(`${u.name} ${u.lastName} ${u.email}`);
      return byRole && blob.includes(q);
    });
  });

  // ------------ CRUD state ------------
  showForm = signal(false);
  editingId = signal<number | string | null>(null);
  f = { name:'', lastName:'', email:'', phone:'', password:'', roleId: 1 };

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.users.set(await this.api.list());
    } catch (e: any) {
      this.error.set(e?.message ?? 'No se pudo cargar usuarios');
    } finally {
      this.loading.set(false);
    }
  }

  // --------- crear/editar/eliminar (igual que ya tenías) ----------
  openCreate() {
    this.editingId.set(null);
    this.f = { name:'', lastName:'', email:'', phone:'', password:'', roleId: 1 };
    this.showForm.set(true);
  }
  openEdit(u: User) {
    this.editingId.set(u.id);
    const inferredRoleId = u.role === 'ADMIN' ? 1 : u.role === 'GERENTE' ? 2 : 3;
    this.f = { name: u.name, lastName: u.lastName, email: u.email, phone:'', password:'', roleId: inferredRoleId };
    this.showForm.set(true);
  }
  cancelForm() { this.showForm.set(false); this.editingId.set(null); }
  async submit() {
    this.loading.set(true);
    this.error.set(null);
    try {
      if (this.editingId()) {
        const dto: UpdateUserDto = {
          name: this.f.name,
          lastName: this.f.lastName,
          email: this.f.email,
          phone: this.f.phone || undefined,
          ...(this.f.password ? { password: this.f.password } : {}),
          roleId: this.f.roleId,
        };
        await this.api.update(this.editingId()!, dto);
      } else {
        const dto: CreateUserDto = {
          name: this.f.name,
          lastName: this.f.lastName,
          email: this.f.email,
          phone: this.f.phone || undefined,
          password: this.f.password,
          roleId: this.f.roleId,
        };
        await this.api.create(dto);
      }
      await this.load();
      this.cancelForm();
    } catch (e: any) {
      this.error.set(e?.message ?? 'No se pudo guardar');
    } finally {
      this.loading.set(false);
    }
  }
  async remove(u: User) {
    if (!confirm(`¿Eliminar a ${u.name} ${u.lastName}?`)) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.api.remove(u.id);
      this.users.set(this.users().filter(x => x.id !== u.id));
    } catch (e: any) {
      this.error.set(e?.message ?? 'No se pudo eliminar');
    } finally {
      this.loading.set(false);
    }
  }
}
