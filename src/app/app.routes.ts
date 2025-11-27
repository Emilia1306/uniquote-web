// src/app/app.routes.ts
import { Routes } from '@angular/router';

import { AppShellComponent } from './layout/app-shell.component';
import { LoginComponent } from './features/auth/login/login.component';
import { VerifyComponent } from './features/auth/verify/verify.component';

import { meReadyGuard } from './core/auth/me-ready.guard';
import { authGuard }    from './core/auth/auth.guard';
import { guestGuard }   from './core/auth/guest.guard';
import { roleGuard }    from './core/auth/role.guard';

import { AdminDashboardComponent }   from './features/admin/dashboard/admin-dashboard/admin-dashboard';
import { GerenteDashboardComponent } from './features/gerente/dashboard/gerente-dashboard/gerente-dashboard';
import { DirectorDashboard }         from './features/director/dashboard/director-dashboard/director-dashboard';

import { QuotesBrowsePage } from './features/cotizaciones/quotes-browse.page';
import { AdminUsersPage }   from './features/admin/users/users.page';
import { ClientesPage }     from './features/clientes/clientes.page';

// 👇 importa el detalle
import { ClienteDetailPage } from './features/clientes/clientes-detail.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  { path: 'login',        component: LoginComponent,  canActivate: [guestGuard] },
  { path: 'verificacion', component: VerifyComponent, canActivate: [guestGuard] },

  {
    path: '',
    component: AppShellComponent,
    canActivate: [meReadyGuard, authGuard],
    children: [
      // ADMIN
      {
        path: 'admin',
        canMatch: [roleGuard(['ADMIN'])],
        children: [
          { path: '', component: AdminDashboardComponent },
          { path: 'cotizaciones', component: QuotesBrowsePage },
          { path: 'usuarios',     component: AdminUsersPage },
          { path: 'clientes',     component: ClientesPage },
          // 👇 detalle de cliente
          { path: 'clientes/:id', component: ClienteDetailPage },
        ]
      },

      // GERENTE
      {
        path: 'gerente',
        canMatch: [roleGuard(['GERENTE'])],
        children: [
          { path: '', component: GerenteDashboardComponent },
          { path: 'cotizaciones', component: QuotesBrowsePage },
          // si el gerente también verá detalle de clientes, añade:
          // { path: 'clientes/:id', component: ClienteDetailPage },
        ]
      },

      // DIRECTOR
      {
        path: 'director',
        canMatch: [roleGuard(['DIRECTOR'])],
        children: [
          { path: '', component: DirectorDashboard },
          { path: 'cotizaciones', component: QuotesBrowsePage },
          // idem si aplica:
          // { path: 'clientes/:id', component: ClienteDetailPage },
        ]
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
