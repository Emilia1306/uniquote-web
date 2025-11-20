import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';

type Item = { label: string; path: string };

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgFor],
  styleUrl: './sidebar.component.scss',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private auth = inject(AuthService);

  role = computed(() => this.auth.role());

  menu = computed<Item[]>(() => {
    switch (this.role()) {
      case 'ADMIN':
        return [
          { label: 'Inicio', path: '/admin' },
          { label: 'Cotizaciones', path: '/admin/cotizaciones' },
          { label: 'Usuarios', path: '/admin/usuarios' },
          { label: 'Clientes', path: '/admin/clientes' },
          { label: 'Tarifario', path: '/admin/tarifario' },
          { label: 'Auditoría', path: '/admin/auditoria' },
        ];
      case 'GERENTE':
        return [
          { label: 'Inicio', path: '/gerente' },
          { label: 'Cotizaciones', path: '/gerente/cotizaciones' },
          { label: 'Estadísticas', path: '/gerente/estadisticas' },
          { label: 'Clientes', path: '/gerente/clientes' },
        ];
      case 'DIRECTOR':
        return [
          { label: 'Inicio', path: '/director' },
          { label: 'Mis Cotizaciones', path: '/director/cotizaciones' },
          { label: 'Biblioteca Aprobadas', path: '/director/biblioteca' },
          { label: 'Clientes', path: '/director/clientes' },
        ];
      default:
        return [];
    }
  });

  logout() {
    this.auth.logout();
  }
}
