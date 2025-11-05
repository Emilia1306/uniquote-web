import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import type { User } from '../models/user';
import type { Role } from './roles';

const LS_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);

  readonly user     = computed(() => this._user());
  readonly isLogged = computed(() => !!this._user());
  readonly role     = computed<Role | null>(() => this._user()?.role ?? null);

  constructor(private router: Router) {
    // Restaura la sesión si había un usuario guardado
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(LS_KEY) : null;
      if (raw) this._user.set(JSON.parse(raw) as User);
    } catch { /* ignore */ }
  }

  async login(email: string, password: string) {
    const role: Role =
      email.includes('admin')   ? 'ADMIN'   :
      email.includes('gerente') ? 'GERENTE' : 'DIRECTOR';

    const fake: User = {
      id: '1',
      name: 'Nombre Usuario',
      email,
      role,
    };

    this._user.set(fake);
    try { localStorage.setItem(LS_KEY, JSON.stringify(fake)); } catch { /* ignore */ }

    // Redirección por rol
    const path = role === 'ADMIN' ? '/admin' : role === 'GERENTE' ? '/gerente' : '/director';
    await this.router.navigateByUrl(path);
  }

  logout() {
    this._user.set(null);
    try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
    this.router.navigateByUrl('/login');
  }

  // DEV: setea un usuario estático sin pasar por el login (para pruebas)
  devSetUser(role: Role = 'ADMIN') {
    const u: User = { id: '1', name: 'Nombre Usuario', email: 'dev@demo.com', role };
    this._user.set(u);
    try { localStorage.setItem(LS_KEY, JSON.stringify(u)); } catch { /* ignore */ }
  }
}
