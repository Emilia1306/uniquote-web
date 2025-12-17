// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { credentialsInterceptor } from './core/http/credentials.interceptor';
import { jwtInterceptor } from './core/http/jwt.interceptor';
import { errorsInterceptor } from './core/http/errors.interceptor';

import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { LucideAngularModule, House, FolderKanban, FileText, Users, Ticket, History, BarChart, Building2, Activity, Clock } from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    // Router
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })
    ),

    // HttpClient + interceptores (orden importa)
    provideHttpClient(
      withInterceptors([
        credentialsInterceptor, // primero: habilita withCredentials para la API
        jwtInterceptor,         // segundo: añade Authorization: Bearer <token>
        errorsInterceptor,      // tercero: maneja 401/otros errores
      ])
    ),

    importProvidersFrom(LucideAngularModule.pick({ House, FolderKanban, FileText, Users, Ticket, History, BarChart, Building2, Activity, Clock }))
  ],
};
