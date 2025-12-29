import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsersApi } from '../../users/data/users.api';
import { AuditoriaApi, LogAuditoria } from '../../data/auditoria.api';
import type { User } from '../../../../core/models/user';
import { AuthService } from '../../../../core/auth/auth.service';

import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';
import { LucideAngularModule } from 'lucide-angular';
import { UiSkeletonComponent } from '../../../../shared/ui/ui-skeleton/ui-skeleton.component';


@Component({
  selector: 'admin-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFor, NgIf, TitleCasePipe, RouterLink, LucideAngularModule, UiSkeletonComponent, TimeAgoPipe],
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

  meId = signal<number | string | null>(null);
  meEmail = signal<string | null>(null);

  async ngOnInit() {
    // Guard: Avoid redundant loading
    if (this.usuarios().length > 0) return;

    this.loadingUsers.set(true);
    this.usersError.set(null);
    this.loadingAudit.set(true);

    try {
      await this.auth.loadMeOnce();
      const me = this.auth.user();
      const myId = (me as any)?.id ?? null;
      const myEmail = (me as any)?.email ?? null;
      this.meId.set(myId);
      this.meEmail.set(myEmail);

      const [recentUsers, recentAudit] = await Promise.all([
        this.usersApi.listRecent(5),
        this.auditoriaApi.listRecent(5)
      ]);

      const cleaned = recentUsers.filter(u =>
        (myId ? u.id !== myId : true) &&
        (myEmail ? u.email !== myEmail : true)
      );
      this.usuarios.set(cleaned);
      this.auditoria.set(recentAudit);

    } catch (e: any) {
      console.error('Error dashboard', e);
      this.usersError.set(e?.message ?? 'No se pudieron cargar los datos');
    } finally {
      this.loadingUsers.set(false);
      this.loadingAudit.set(false);
    }
  }
}
