// src/app/app.routes.ts
import { Routes } from '@angular/router';

// Shell con Topbar + Sidebar
import { AppShellComponent } from './layout/app-shell.component';

// Login
import { LoginComponent } from './features/auth/login/login.component';

// Guards
import { meReadyGuard } from './core/auth/me-ready.guard';
import { authGuard }    from './core/auth/auth.guard';
import { roleGuard }    from './core/auth/role.guard';
import { guestGuard }   from './core/auth/guest.guard';

// Dashboards (standalone)
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard/admin-dashboard';
import { GerenteDashboardComponent } from './features/gerente/dashboard/gerente-dashboard/gerente-dashboard';
import { DirectorDashboard } from './features/director/dashboard/director-dashboard/director-dashboard';
import { QuotesBrowsePage } from './features/cotizaciones/quotes-browse.page';


export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // público: solo invitados
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },

  // protegido: rehidrata -> exige sesión -> luego valida rol por rama
  {
    path: '',
    component: AppShellComponent,
    canActivate: [meReadyGuard, authGuard],
    children: [
      // ADMIN
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          { path: '', component: AdminDashboardComponent },
          { path: 'cotizaciones', component: QuotesBrowsePage },
          // { path: 'usuarios', loadComponent: () => import('./features/admin/usuarios/usuarios.page').then(m => m.AdminUsuariosPage) },
          // etc.
        ]
      },

      // GERENTE
      {
        path: 'gerente',
        canActivate: [roleGuard],
        data: { roles: ['GERENTE'] },
        children: [
          { path: '', component: GerenteDashboardComponent },
          { path: 'cotizaciones', component: QuotesBrowsePage },
          // { path: 'clientes', loadComponent: () => import('./features/gerente/clientes/gerente-clientes.page').then(m => m.GerenteClientesPage) },
        ]
      },

      // DIRECTOR
      {
        path: 'director',
        canActivate: [roleGuard],
        data: { roles: ['DIRECTOR'] },
        children: [
          { path: '', component: DirectorDashboard },
          // { path: 'cotizaciones', loadComponent: () => import('./features/director/cotizaciones/director-cotizaciones.page').then(m => m.DirectorCotizacionesPage) },
          // { path: 'biblioteca', loadComponent: () => import('./features/director/biblioteca/director-biblioteca.page').then(m => m.DirectorBibliotecaPage) },
        ]
      },
    ],
  },

  // fallback
  { path: '**', redirectTo: 'login' },
];
