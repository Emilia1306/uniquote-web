import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';

import { AuthService } from '../core/auth/auth.service';
import { TopbarComponent } from '../shared/ui/topbar/topbar.component';
import { SidebarComponent } from '../shared/ui/sidebar/sidebar.component';

@Component({
  standalone: true,
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    NgIf,
    NgClass,
    TopbarComponent,
    SidebarComponent,
  ],
  templateUrl: './app-shell.component.html',
})
export class AppShellComponent implements OnInit {

  private auth = inject(AuthService);
  private router = inject(Router);

  open = signal(false);

  // RUTAS donde NO se debe mostrar sidebar (wizard mode)
  hideSideRoutes = [
    '/gerente/cotizaciones/crear',
    '/gerente/cotizaciones/editar',
    '/director/cotizaciones/crear',
    '/director/cotizaciones/editar',
    '/admin/cotizaciones/crear',
    '/admin/cotizaciones/editar'
  ];

  shouldHideSidebar(): boolean {
    const url = this.router.url;

    return this.hideSideRoutes.some(path =>
      url.startsWith(path)
    );
  }

  toggleDrawer() { this.open.update(v => !v); }
  closeDrawer() { this.open.set(false); }

  async ngOnInit() {
    await this.auth.loadMeOnce();
    this.router.events.subscribe(() => this.closeDrawer());
  }
}
