// src/app/app.routes.ts
import { Routes } from '@angular/router';

import { AppShellComponent } from './layout/app-shell.component';

import { meReadyGuard } from './core/auth/me-ready.guard';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'verificacion',
    loadComponent: () => import('./features/auth/verify/verify.component').then(m => m.VerifyComponent),
    canActivate: [guestGuard]
  },
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
          {
            path: '',
            loadComponent: () => import('./features/admin/dashboard/admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent)
          },
          {
            path: 'cotizaciones',
            loadComponent: () => import('./features/cotizaciones/quotes-browse.page').then(m => m.QuotesBrowsePage)
          },
          {
            path: 'cotizaciones/:id',
            loadComponent: () => import('./features/cotizaciones/detalle/cotizacion-detail.page').then(m => m.CotizacionDetailPage)
          },
          {
            path: 'cotizaciones/editar/:id',
            loadComponent: () => import('./features/cotizaciones/crear/crear-cotizacion.page').then(m => m.CrearCotizacionPage)
          },
          {
            path: 'usuarios',
            loadComponent: () => import('./features/admin/users/users.page').then(m => m.AdminUsersPage)
          },
          {
            path: 'clientes',
            loadComponent: () => import('./features/clientes/clientes.page').then(m => m.ClientesPage)
          },
          {
            path: 'clientes/:id',
            loadComponent: () => import('./features/clientes/clientes-detail.page').then(m => m.ClienteDetailPage)
          },
          {
            path: 'clientes/:id/proyectos',
            loadComponent: () => import('./features/proyectos/proyectos-browse.page').then(m => m.ProyectosBrowsePage)
          },
          {
            path: 'proyectos',
            loadComponent: () => import('./features/proyectos/proyectos-browse.page').then(m => m.ProyectosBrowsePage)
          },
          {
            path: 'proyectos/:projectId',
            loadComponent: () => import('./features/proyectos/proyecto-details.page').then(m => m.ProyectoDetailsPage)
          },
          {
            path: 'tarifario',
            loadComponent: () => import('./features/tarifario/tarifario.page').then(m => m.TarifarioPage)
          },
          {
            path: 'auditoria',
            loadComponent: () => import('./features/admin/auditoria/auditoria.page').then(m => m.AuditoriaPage)
          },
        ]
      },

      // GERENTE
      {
        path: 'gerente',
        canMatch: [roleGuard(['GERENTE'])],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/gerente/dashboard/gerente-dashboard/gerente-dashboard').then(m => m.GerenteDashboardComponent)
          },
          {
            path: 'estadisticas-equipo',
            loadComponent: () => import('./features/gerente/employee-stats/employee-stats.page').then(m => m.EmployeeStatsPage)
          },

          // PROYECTOS
          {
            path: 'proyectos',
            loadComponent: () => import('./features/proyectos/proyectos-browse.page').then(m => m.ProyectosBrowsePage)
          },
          {
            path: 'proyectos/:projectId',
            loadComponent: () => import('./features/proyectos/proyecto-details.page').then(m => m.ProyectoDetailsPage)
          },

          // CLIENTES
          {
            path: 'clientes',
            loadComponent: () => import('./features/clientes/clientes.page').then(m => m.ClientesPage)
          },
          {
            path: 'clientes/:id',
            loadComponent: () => import('./features/clientes/clientes-detail.page').then(m => m.ClienteDetailPage)
          },
          {
            path: 'clientes/:id/proyectos',
            loadComponent: () => import('./features/proyectos/proyectos-browse.page').then(m => m.ProyectosBrowsePage)
          },

          // COTIZACIONES
          {
            path: 'cotizaciones',
            loadComponent: () => import('./features/cotizaciones/quotes-browse.page').then(m => m.QuotesBrowsePage)
          },
          {
            path: 'cotizaciones/crear',
            loadComponent: () => import('./features/cotizaciones/crear/crear-cotizacion.page').then(m => m.CrearCotizacionPage)
          },
          {
            path: 'cotizaciones/:id',
            loadComponent: () => import('./features/cotizaciones/detalle/cotizacion-detail.page').then(m => m.CotizacionDetailPage)
          },
          {
            path: 'cotizaciones/editar/:id',
            loadComponent: () => import('./features/cotizaciones/crear/crear-cotizacion.page').then(m => m.CrearCotizacionPage)
          },
        ]
      },

      // DIRECTOR
      {
        path: 'director',
        canMatch: [roleGuard(['DIRECTOR'])],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/director/dashboard/director-dashboard/director-dashboard').then(m => m.DirectorDashboard)
          },
          {
            path: 'estadisticas',
            loadComponent: () => import('./features/director/dashboard/director-dashboard/director-dashboard').then(m => m.DirectorDashboard)
          },
          {
            path: 'estadisticas-equipo',
            loadComponent: () => import('./features/gerente/employee-stats/employee-stats.page').then(m => m.EmployeeStatsPage)
          },
          {
            path: 'clientes',
            loadComponent: () => import('./features/clientes/clientes.page').then(m => m.ClientesPage)
          },
          {
            path: 'clientes/:id',
            loadComponent: () => import('./features/clientes/clientes-detail.page').then(m => m.ClienteDetailPage)
          },
          {
            path: 'clientes/:id/proyectos',
            loadComponent: () => import('./features/proyectos/proyectos-browse.page').then(m => m.ProyectosBrowsePage)
          },

          // PROYECTOS
          {
            path: 'proyectos',
            loadComponent: () => import('./features/proyectos/proyectos-browse.page').then(m => m.ProyectosBrowsePage)
          },
          {
            path: 'proyectos/:projectId',
            loadComponent: () => import('./features/proyectos/proyecto-details.page').then(m => m.ProyectoDetailsPage)
          },

          {
            path: 'cotizaciones',
            loadComponent: () => import('./features/cotizaciones/quotes-browse.page').then(m => m.QuotesBrowsePage)
          },
          {
            path: 'cotizaciones/crear',
            loadComponent: () => import('./features/cotizaciones/crear/crear-cotizacion.page').then(m => m.CrearCotizacionPage)
          },
          {
            path: 'cotizaciones/:id',
            loadComponent: () => import('./features/cotizaciones/detalle/cotizacion-detail.page').then(m => m.CotizacionDetailPage)
          },
          {
            path: 'cotizaciones/editar/:id',
            loadComponent: () => import('./features/cotizaciones/crear/crear-cotizacion.page').then(m => m.CrearCotizacionPage)
          },
        ]
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
