import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { Component } from '@angular/core';

@Component({ standalone: true, template: `<div class="p-6"><h2 class="text-xl font-semibold">Dashboard Admin</h2></div>` })
export class AdminDummy {}
@Component({ standalone: true, template: `<div class="p-6"><h2 class="text-xl font-semibold">Dashboard Gerente</h2></div>` })
export class GerenteDummy {}
@Component({ standalone: true, template: `<div class="p-6"><h2 class="text-xl font-semibold">Dashboard Director</h2></div>` })
export class DirectorDummy {}

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },

  // dummies para probar la redirección post-login
  { path: 'admin', component: AdminDummy },
  { path: 'gerente', component: GerenteDummy },
  { path: 'director', component: DirectorDummy },

  { path: '**', redirectTo: 'login' }
];
