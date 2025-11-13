// src/app/core/auth/auth.service.ts
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User } from '../models/user';
import { Role, normalizeRole, roleHome } from './roles';

type LoginDto = { email: string; password: string; rememberDevice?: boolean };
type LoginOk = { accessToken: string; user?: any };
type LoginMfa = { status: 'MFA_REQUIRED'; message?: string };
type LoginResponse = LoginOk | LoginMfa;

const TOKEN_KEY = 'uniquote.jwt';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _user = signal<User | null>(null);
  readonly user     = computed(() => this._user());
  readonly isLogged = computed(() => !!this._user());
  readonly role     = computed<Role | null>(() => this._user()?.role ?? null);

  // email pendiente cuando la API pide MFA
  private _pendingEmail = signal<string | null>(null);
  readonly pendingEmail = computed(() => this._pendingEmail());

  // Para evitar múltiples rehidrataciones concurrentes
  private _loadOncePromise: Promise<void> | null = null;

  // ---------- LOGIN con MFA opcional ----------
  async loginOrAskMfa(dto: LoginDto) {
    const url = `${environment.apiUrl}/auth/login`;
    const res = await this.http.post<LoginResponse>(url, dto).toPromise();

    // Caso 1: API pide MFA
    if (res && 'status' in res && res.status === 'MFA_REQUIRED') {
      this._pendingEmail.set(dto.email.trim());
      await this.router.navigateByUrl('/verificacion');
      return;
    }

    // Caso 2: token directo
    const ok = res as LoginOk;
    if (!ok?.accessToken) throw new Error('La API no devolvió accessToken');

    localStorage.setItem(TOKEN_KEY, ok.accessToken);
    let user = ok.user ?? await this.fetchMe();
    const rawRole =
      (user as any)?.role ??
      (user as any)?.roleName ??
      (user as any)?.name ?? '';
    user = { ...user, role: normalizeRole(rawRole) };
    this._user.set(user);
    await this.router.navigateByUrl(roleHome(user.role));
  }

  // ---------- Verificar código MFA ----------
  async verifyEmailCode(code: string, rememberDevice = true) {
    const email = this._pendingEmail();
    if (!email) throw new Error('No hay email pendiente para verificación');

    const url = `${environment.apiUrl}/auth/verify-email-code`;
    const res = await this.http
      .post<{ accessToken: string; user?: any }>(url, { email, code, rememberDevice })
      .toPromise();

    if (!res?.accessToken) throw new Error('La verificación no devolvió accessToken');

    localStorage.setItem(TOKEN_KEY, res.accessToken);
    let user = res.user ?? await this.fetchMe();
    const rawRole =
      (user as any)?.role ??
      (user as any)?.roleName ??
      (user as any)?.name ?? '';
    user = { ...user, role: normalizeRole(rawRole) };
    this._user.set(user);

    // limpiar email pendiente y redirigir
    this._pendingEmail.set(null);
    await this.router.navigateByUrl(roleHome(user.role));
  }

  // ---------- Reenviar código ----------
  async resendEmailCode() {
    const email = this._pendingEmail();
    if (!email) throw new Error('No hay email pendiente');
    const url = `${environment.apiUrl}/auth/resend-email-code`;
    await this.http.post(url, { email }).toPromise();
  }

  // ---------- GET /auth/inf ----------
  async fetchMe(): Promise<User> {
    const meUrl = `${environment.apiUrl}/auth/inf`;
    const me = await this.http.get<User>(meUrl).toPromise();
    if (!me) throw new Error('No se pudo obtener la información del usuario');

    const rawRole =
      (me as any)?.role ??
      (me as any)?.roleName ??
      (me as any)?.name ?? '';

    return { ...me, role: normalizeRole(rawRole) };
  }

  // ---------- Rehidratar sesión ----------
  async loadMe() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
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
    this._pendingEmail.set(null);
    this.router.navigateByUrl('/login');
  }
}
