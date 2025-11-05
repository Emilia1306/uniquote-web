import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import type { User } from '../models/user';
import type { Role } from './roles';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);

  readonly user      = computed(() => this._user());
  readonly isLogged  = computed(() => !!this._user());
  readonly role      = computed<Role | null>(() => this._user()?.role ?? null);

  constructor(private router: Router) {}

  // MOCK: simula login. Sustituye por tu llamada real a la API (Nest).
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

    // Redirección por rol (luego creamos esos dashboards)
    const path = role === 'ADMIN' ? '/admin' : role === 'GERENTE' ? '/gerente' : '/director';
    await this.router.navigateByUrl(path);
  }

  logout() {
    this._user.set(null);
    this.router.navigateByUrl('/login');
  }
}
