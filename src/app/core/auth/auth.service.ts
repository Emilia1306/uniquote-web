// src/app/core/auth/auth.service.ts
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginDto, LoginResponse } from '../models/auth';
import { User } from '../models/user';
import { Role, normalizeRole, roleHome } from './roles';

const TOKEN_KEY = 'uniquote.jwt';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _user = signal<User | null>(null);
  readonly user    = computed(() => this._user());
  readonly isLogged = computed(() => !!this._user());
  readonly role     = computed<Role | null>(() => this._user()?.role ?? null);

  // Para evitar múltiples rehidrataciones concurrentes
  private _loadOncePromise: Promise<void> | null = null;

  // ---- LOGIN: guarda token, obtiene user, normaliza rol y redirige ----
  async loginApi(dto: LoginDto) {
    const url = `${environment.apiUrl}/auth/login`;
    const res = await this.http.post<LoginResponse>(url, dto).toPromise();

    if (!res?.accessToken) throw new Error('La API no devolvió accessToken');

    // 1) guardar token
    localStorage.setItem(TOKEN_KEY, res.accessToken);

    // 2) obtener user (si no vino en la respuesta del login)
    let user = res.user ?? await this.fetchMe();

    // 3) normalizar rol (tu normalizeRole espera string; intentamos varias llaves comunes)
    const rawRole =
      (user as any)?.role ??
      (user as any)?.roleName ??
      (user as any)?.name ??
      ''; // fallback string vacío

    user = { ...user, role: normalizeRole(rawRole) };
    this._user.set(user);

    // 4) redirigir al home según rol
    await this.router.navigateByUrl(roleHome(user.role));
  }

  // ---- GET /auth/inf usando el token guardado ----
  async fetchMe(): Promise<User> {
    const meUrl = `${environment.apiUrl}/auth/inf`;
    const me = await this.http.get<User>(meUrl).toPromise();
    if (!me) throw new Error('No se pudo obtener la información del usuario');

    const rawRole =
      (me as any)?.role ??
      (me as any)?.roleName ??
      (me as any)?.name ??
      '';

    return { ...me, role: normalizeRole(rawRole) };
  }

  // ---- Rehidratar sesión (si hay token) ----
  async loadMe() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return; // no hay sesión previa
    try {
      const me = await this.fetchMe();
      this._user.set(me);
    } catch {
      this.logout();
    }
  }

  async loadMeOnce(): Promise<void> {
    if (this._loadOncePromise) return this._loadOncePromise;
    this._loadOncePromise = (async () => {
      try { await this.loadMe(); } finally { this._loadOncePromise = null; }
    })();
    return this._loadOncePromise;
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this._user.set(null);
    this.router.navigateByUrl('/login');
  }
}
