// src/app/app.routes.ts
import { Routes } from '@angular/router';

// Shell con Topbar + Sidebar
import { AppShellComponent } from './layout/app-shell.component';

// Páginas públicas
import { LoginComponent } from './features/auth/login/login.component';
import { VerifyComponent } from './features/auth/verify/verify.component';

// Guards
import { meReadyGuard } from './core/auth/me-ready.guard';
import { authGuard }    from './core/auth/auth.guard';
import { roleGuard }    from './core/auth/role.guard';
import { guestGuard }   from './core/auth/guest.guard';

// Dashboards (standalone)
import { AdminDashboardComponent }   from './features/admin/dashboard/admin-dashboard/admin-dashboard';
import { GerenteDashboardComponent } from './features/gerente/dashboard/gerente-dashboard/gerente-dashboard';
import { DirectorDashboard }         from './features/director/dashboard/director-dashboard/director-dashboard';

// Cotizaciones
import { QuotesBrowsePage } from './features/cotizaciones/quotes-browse.page';
import { AdminUsersPage } from './features/admin/users/users.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // Público: solo invitados (si ya está logueado, guestGuard redirige)
  { path: 'login',        component: LoginComponent,  canActivate: [guestGuard] },
  { path: 'verificacion', component: VerifyComponent, canActivate: [guestGuard] },

  // Protegido: rehidrata -> exige sesión -> valida rol por rama
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
          { path: 'usuarios', component: AdminUsersPage },
          // { path: 'tarifario', loadComponent: ... },
          // { path: 'auditoria', loadComponent: ... },
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
          // { path: 'clientes', loadComponent: ... },
          // { path: 'estadisticas', loadComponent: ... },
        ]
      },

      // DIRECTOR
      {
        path: 'director',
        canActivate: [roleGuard],
        data: { roles: ['DIRECTOR'] },
        children: [
          { path: '', component: DirectorDashboard },
          { path: 'cotizaciones', component: QuotesBrowsePage },
          // { path: 'biblioteca', loadComponent: ... },
          // { path: 'clientes', loadComponent: ... },
        ]
      },
    ],
  },

  // fallback
  { path: '**', redirectTo: 'login' },
];
