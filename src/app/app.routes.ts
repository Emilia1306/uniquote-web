import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { Component } from '@angular/core';
import { AppShellComponent } from './layout/app-shell.component';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard/admin-dashboard';
import { GerenteDashboardComponent } from './features/gerente/dashboard/gerente-dashboard/gerente-dashboard';

@Component({ standalone: true, template: `<div class="p-6"><h2 class="text-xl font-semibold">Dashboard Director</h2></div>` })
export class DirectorDummy {}

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: 'admin', component: AdminDashboardComponent },
      { path: 'gerente', component: GerenteDashboardComponent },
      { path: 'director', component: DirectorDummy },
    ]
  },

  { path: '**', redirectTo: 'login' },
];
