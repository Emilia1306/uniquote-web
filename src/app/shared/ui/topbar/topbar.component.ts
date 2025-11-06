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

  initials = computed(() => {
    const n = this.user()?.name?.trim() ?? '';
    return n ? n.split(/\s+/).slice(0, 2).map(w => w[0]!.toUpperCase()).join('') : 'UQ';
  });

  roleText = computed(() => this.user()?.role ?? '—');
}
