import { Component, computed, inject } from '@angular/core';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [HlmAvatarImports],
  templateUrl: './topbar.component.html'
})
export class TopbarComponent {
  private auth = inject(AuthService);
  user = computed(() => this.auth.user());

  /** Nombre completo: "Juan Pérez" (con fallback) */
  fullName = computed(() => {
    const u = this.user();
    const name = (u?.name ?? '').trim();
    const last = (u?.lastName ?? '').trim();
    const full = [name, last].filter(Boolean).join(' ').trim();
    return full || 'Usuario';
  });

  /** Iniciales a partir de nombre y apellido: "JP" */
  initials = computed(() => {
    const u = this.user();
    const name = (u?.name ?? '').trim();
    const last = (u?.lastName ?? '').trim();
    const a = name ? name[0]!.toUpperCase() : '';
    const b = last ? last[0]!.toUpperCase() : '';
    return (a + b) || 'UQ';
  });

  roleText = computed(() => {
    const r = this.user()?.role;
    const map: Record<string, string> = {
      ADMIN: 'ADMIN',
      GERENTE: 'GERENTE',
      DIRECTOR: 'DIRECTOR',
    };

    const key = String(r ?? '').toUpperCase();
    const raw = String(r ?? '').trim();      

    return map[key] ?? (raw || '—');
  });
}
