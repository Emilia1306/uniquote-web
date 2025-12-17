// src/app/app.routes.ts
import { Routes } from '@angular/router';

import { AppShellComponent } from './layout/app-shell.component';
import { LoginComponent } from './features/auth/login/login.component';
import { VerifyComponent } from './features/auth/verify/verify.component';

import { meReadyGuard } from './core/auth/me-ready.guard';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';
import { roleGuard } from './core/auth/role.guard';

import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard/admin-dashboard';
import { GerenteDashboardComponent } from './features/gerente/dashboard/gerente-dashboard/gerente-dashboard';
import { DirectorDashboard } from './features/director/dashboard/director-dashboard/director-dashboard';
import { EmployeeStatsPage } from './features/gerente/employee-stats/employee-stats.page';

import { QuotesBrowsePage } from './features/cotizaciones/quotes-browse.page';
import { AdminUsersPage } from './features/admin/users/users.page';
import { ClientesPage } from './features/clientes/clientes.page';

// Cotizaciones
import { CrearCotizacionPage } from './features/cotizaciones/crear/crear-cotizacion.page';
import { CotizacionDetailPage } from './features/cotizaciones/detalle/cotizacion-detail.page';

import { ProyectosBrowsePage } from './features/proyectos/proyectos-browse.page';
import { ProyectoDetailsPage } from './features/proyectos/proyecto-details.page';


import { ClienteDetailPage } from './features/clientes/clientes-detail.page';
import { TarifarioPage } from './features/tarifario/tarifario.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'verificacion', component: VerifyComponent, canActivate: [guestGuard] },
  {
    path: 'cambiar-password',
    loadComponent: () => import('./features/auth/set-initial-password/set-initial-password.component').then(m => m.SetInitialPasswordComponent),
    canActivate: [guestGuard]
  },


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
          { path: 'cotizaciones/:id', component: CotizacionDetailPage },
          { path: 'cotizaciones/editar/:id', component: CrearCotizacionPage },
          { path: 'usuarios', component: AdminUsersPage },
          { path: 'clientes', component: ClientesPage },
          { path: 'clientes/:id', component: ClienteDetailPage },
          { path: 'clientes/:id/proyectos', component: ProyectosBrowsePage },
          { path: 'proyectos', component: ProyectosBrowsePage },
          { path: 'proyectos/:projectId', component: ProyectoDetailsPage },
          { path: 'tarifario', component: TarifarioPage },
          { path: 'auditoria', loadComponent: () => import('./features/admin/auditoria/auditoria.page').then(m => m.AuditoriaPage) },
        ]
      },

      // GERENTE
      {
        path: 'gerente',
        canMatch: [roleGuard(['GERENTE'])],
        children: [
          { path: '', component: GerenteDashboardComponent },
          { path: 'estadisticas-equipo', component: EmployeeStatsPage },

          // PROYECTOS
          { path: 'proyectos', component: ProyectosBrowsePage },
          { path: 'proyectos/:projectId', component: ProyectoDetailsPage },

          // CLIENTES
          { path: 'clientes', component: ClientesPage },
          { path: 'clientes/:id', component: ClienteDetailPage },
          { path: 'clientes/:id/proyectos', component: ProyectosBrowsePage },

          // COTIZACIONES
          { path: 'cotizaciones', component: QuotesBrowsePage },
          { path: 'cotizaciones/crear', component: CrearCotizacionPage },
          { path: 'cotizaciones/:id', component: CotizacionDetailPage },
          { path: 'cotizaciones/editar/:id', component: CrearCotizacionPage },
        ]
      },

      // DIRECTOR
      {
        path: 'director',
        canMatch: [roleGuard(['DIRECTOR'])],
        children: [
          { path: '', component: DirectorDashboard },
          { path: 'estadisticas', component: DirectorDashboard },
          { path: 'estadisticas-equipo', component: EmployeeStatsPage },
          { path: 'clientes', component: ClientesPage },
          { path: 'clientes/:id', component: ClienteDetailPage },
          { path: 'clientes/:id/proyectos', component: ProyectosBrowsePage },

          // PROYECTOS
          { path: 'proyectos', component: ProyectosBrowsePage },
          { path: 'proyectos/:projectId', component: ProyectoDetailsPage },

          { path: 'cotizaciones', component: QuotesBrowsePage },
          { path: 'cotizaciones/crear', component: CrearCotizacionPage },
          { path: 'cotizaciones/:id', component: CotizacionDetailPage },
          { path: 'cotizaciones/editar/:id', component: CrearCotizacionPage },
        ]
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
