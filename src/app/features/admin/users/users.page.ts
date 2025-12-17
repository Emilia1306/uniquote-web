import { Component, HostListener, inject, signal, computed, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersApi, CreateUserDto, UpdateUserDto } from './data/users.api';
import type { User } from '../../../core/models/user';
import type { Role } from '../../../core/auth/roles';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/auth/auth.service';
import Swal from 'sweetalert2';

function normalizeTxt(s: string) {
  return (s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

type RoleFilter = Role | 'ALL';

@Component({
  standalone: true,
  selector: 'admin-users-page',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './users.page.html',
})
export class AdminUsersPage {
  private api = inject(UsersApi);
  private auth = inject(AuthService);

  // ------------ Data ------------
  loading = signal(false);
  error = signal<string | null>(null);
  users = signal<User[]>([]);

  meId = signal<number | string | null>(null);
  meEmail = signal<string | null>(null);

  // ------------ Filtros (lista) ------------
  public _searchRaw = signal('');
  search = signal('');
  roleFilter = signal<RoleFilter>('ALL');

  // Dropdown de rol (lista)
  isRoleOpen = signal(false);
  readonly roleOptions: RoleFilter[] = ['ALL', 'ADMIN', 'GERENTE', 'DIRECTOR'];
  roleLabel(r: RoleFilter) { return r === 'ALL' ? 'Todos los roles' : r; }
  toggleRoleDropdown() { this.isRoleOpen.update(v => !v); }
  setRole(r: RoleFilter) { this.roleFilter.set(r); this.isRoleOpen.set(false); this.page.set(0); }

  // Debounce búsqueda
  private searchTimer: any = null;
  onSearchChange(v: string) {
    this._searchRaw.set(v);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.search.set(v.trim()); this.page.set(0); }, 250);
  }

  // Lista filtrada
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

  // ------------ Paginación ------------
  page = signal(0);               // 0-based
  pageSize = signal(10);
  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize())));
  startIndex = computed(() => this.page() * this.pageSize());
  endIndex = computed(() => Math.min(this.startIndex() + this.pageSize(), this.filtered().length));
  paged = computed(() => this.filtered().slice(this.startIndex(), this.endIndex()));
  hasPrev = computed(() => this.page() > 0);
  hasNext = computed(() => this.page() < this.totalPages() - 1);
  prevPage() { if (this.hasPrev()) this.page.set(this.page() - 1); }
  nextPage() { if (this.hasNext()) this.page.set(this.page() + 1); }
  goPage(i: number) { if (i >= 0 && i < this.totalPages()) this.page.set(i); }
  pagesArray = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i));

  // ------------ CRUD ------------
  showForm = signal(false);
  editingId = signal<number | string | null>(null);
  f = { name: '', lastName: '', email: '', phone: '', password: '', roleId: 1 };

  // Dropdown de rol en MODAL
  isFormRoleOpen = signal(false);
  formRolePlacement = signal<'down' | 'up'>('down'); // auto re-ubicar
  readonly formRoleOptions = [
    { id: 1, label: 'ADMIN' },
    { id: 2, label: 'GERENTE' },
    { id: 3, label: 'DIRECTOR' },
  ];
  formRoleLabel() { return this.formRoleOptions.find(x => x.id === this.f.roleId)?.label ?? 'Selecciona un rol'; }

  // Decide si abrir hacia arriba/abajo según el espacio disponible
  toggleFormRole(btnEl: HTMLElement) {
    const rect = btnEl.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const needed = 240; // ~altura máx del menú
    this.formRolePlacement.set(spaceBelow < needed ? 'up' : 'down');
    this.isFormRoleOpen.update(v => !v);
  }
  pickFormRole(id: number) { this.f.roleId = id; this.isFormRoleOpen.set(false); }

  // Abrir/llenar
  async ngOnInit() {
    await this.auth.loadMeOnce();
    await this.load();
  }
  async load() {
    this.loading.set(true); this.error.set(null);
    try {
      const all = await this.api.list();
      const me = this.auth.user();
      const myId = (me as any)?.id ?? null;
      const myEmail = (me as any)?.email ?? null;
      this.meId.set(myId); this.meEmail.set(myEmail);

      // Excluye al usuario logueado
      const cleaned = all.filter(u =>
        (myId ? u.id !== myId : true) &&
        (myEmail ? u.email !== myEmail : true)
      );
      this.users.set(cleaned);
      this.page.set(0);
    } catch (e: any) {
      const msg = e?.message ?? 'No se pudo cargar usuarios';
      this.error.set(msg);
      Swal.fire({
        icon: 'error',
        title: 'Error cargando usuarios',
        text: msg,
        confirmButtonColor: 'var(--brand)'
      });
    } finally {
      this.loading.set(false);
    }
  }

  openCreate() {
    this.editingId.set(null);
    this.f = { name: '', lastName: '', email: '', phone: '', password: '', roleId: 1 };
    this.showForm.set(true);
  }
  openEdit(u: User) {
    this.editingId.set(u.id);
    const inferredRoleId = u.role === 'ADMIN' ? 1 : u.role === 'GERENTE' ? 2 : 3;
    this.f = { name: u.name, lastName: u.lastName, email: u.email, phone: (u as any).phone || '', password: '', roleId: inferredRoleId };
    this.showForm.set(true);
  }
  cancelForm() {
    this.showForm.set(false);
    this.isFormRoleOpen.set(false);
    this.editingId.set(null);
  }

  async submit() {
    this.loading.set(true); this.error.set(null);
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

      Swal.fire({
        icon: 'success',
        title: 'Guardado',
        text: 'Usuario guardado correctamente',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (e: any) {
      const msg = e?.message ?? 'No se pudo guardar';
      this.error.set(msg);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg,
        confirmButtonColor: 'var(--brand)'
      });
    } finally {
      this.loading.set(false);
    }
  }

  async remove(u: User) {
    const res = await Swal.fire({
      title: '¿Eliminar usuario?',
      text: `Se eliminará a ${u.name} ${u.lastName}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#71717a',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!res.isConfirmed) return;

    this.loading.set(true); this.error.set(null);
    try {
      await this.api.remove(u.id);
      this.users.set(this.users().filter(x => x.id !== u.id));
      if (this.paged().length === 0 && this.page() > 0) this.page.set(this.page() - 1);

      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'Usuario eliminado correctamente',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (e: any) {
      const msg = e?.message ?? 'No se pudo eliminar';
      this.error.set(msg);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg,
        confirmButtonColor: 'var(--brand)'
      });
    } finally {
      this.loading.set(false);
    }
  }

  // Cerrar modal con ESC
  @HostListener('document:keydown.escape', ['$event'])
  onEsc(_ev: KeyboardEvent | Event) { if (this.showForm()) this.cancelForm(); }
}
