// src/app/features/admin/dashboard/admin-dashboard.ts
import { Component, inject, signal } from '@angular/core';
import { NgFor, NgIf, NgClass, TitleCasePipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsersApi } from '../../users/data/users.api';
import { AuditoriaApi, LogAuditoria } from '../../data/auditoria.api';
import type { User } from '../../../../core/models/user';
import { AuthService } from '../../../../core/auth/auth.service';



import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'admin-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, TitleCasePipe, RouterLink, DatePipe, TimeAgoPipe, LucideAngularModule],
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboardComponent {
  private usersApi = inject(UsersApi);
  private auditoriaApi = inject(AuditoriaApi);
  private auth = inject(AuthService);

  usuarios = signal<User[]>([]);
  loadingUsers = signal<boolean>(false);
  usersError = signal<string | null>(null);

  auditoria = signal<LogAuditoria[]>([]);
  loadingAudit = signal<boolean>(false);

  // (Opcional) por si quieres mostrarlos / depurar
  meId = signal<number | string | null>(null);
  meEmail = signal<string | null>(null);

  async ngOnInit() {
    this.loadingUsers.set(true);
    this.usersError.set(null);
    this.loadingAudit.set(true);

    try {
      // Asegura tener al usuario autenticado disponible
      await this.auth.loadMeOnce();
      const me = this.auth.user();
      const myId = (me as any)?.id ?? null;
      const myEmail = (me as any)?.email ?? null;
      this.meId.set(myId);
      this.meEmail.set(myEmail);

      // Trae últimos 5 y filtra al usuario actual
      const recent = await this.usersApi.listRecent(5);
      const cleaned = recent.filter(u =>
        (myId ? u.id !== myId : true) &&
        (myEmail ? u.email !== myEmail : true)
      );

      this.usuarios.set(cleaned);

      // Cargar auditoria reciente
      const logs = await this.auditoriaApi.listRecent(5);
      this.auditoria.set(logs);

    } catch (e: any) {
      console.error('Error dashboard', e);
      this.usersError.set(e?.message ?? 'No se pudieron cargar los datos');
    } finally {
      this.loadingUsers.set(false);
      this.loadingAudit.set(false);
    }
  }

  // clases para el pill por rol (mismo diseño)
  rolePillClasses(role: string) {
    const r = (role ?? '').toLowerCase();
    return {
      'inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium text-white': true,
      'bg-red-500': r === 'admin',
      'bg-orange-500': r === 'gerente',
      'bg-amber-500': r === 'director',
    };
  }
}
