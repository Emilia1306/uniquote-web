import { Component, inject, computed, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { ROLE_MENU, MenuItem } from '../../config/role-menu';
import { LucideAngularModule } from 'lucide-angular';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    RouterLink,
    RouterLinkActive,
    NgFor,
    LucideAngularModule
  ],
  styleUrl: './sidebar.component.scss',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {

  private auth = inject(AuthService);

  menu = computed<MenuItem[]>(() => {
    const role = this.auth.role();

    if (!role) return [];

    return [...ROLE_MENU[role]];
  });

  logout() {
    this.auth.logout();
  }
}
