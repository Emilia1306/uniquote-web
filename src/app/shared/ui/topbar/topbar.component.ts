import { Component, computed, signal, inject, Output, EventEmitter, HostListener } from '@angular/core';
import { NgIf } from '@angular/common';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [NgIf, HlmAvatarImports, LucideAngularModule],
  templateUrl: './topbar.component.html',
})
export class TopbarComponent {
  private auth = inject(AuthService);

  @Output() openDrawer = new EventEmitter<void>();

  menuOpen = signal(false);
  user = computed(() => this.auth.user());

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

  /** CIERRA el menú cuando se clickea fuera */
  @HostListener('document:click', ['$event'])
  clickOutside(ev: Event) {
    const target = ev.target as HTMLElement;
    if (!target.closest('.topbar-user-area')) {
      this.menuOpen.set(false);
    }
  }

  // Datos del usuario
  fullName = computed(() => {
    const u = this.user();
    return `${u?.name ?? ''} ${u?.lastName ?? ''}`.trim() || 'Usuario';
  });

  initials = computed(() => {
    const u = this.user();
    return ((u?.name?.[0] ?? '') + (u?.lastName?.[0] ?? '')).toUpperCase() || 'UQ';
  });

  roleText = computed(() => {
    const r = this.user()?.role;
    return r ? r.charAt(0).toUpperCase() + r.slice(1).toLowerCase() : '—';
  });

  profile() { this.closeMenu(); }
  settings() { this.closeMenu(); }

  logout() {
    this.closeMenu();
    this.auth.logout();
  }
}
