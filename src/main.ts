// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppRoot } from './app/app.root';
import { AuthService } from './app/core/auth/auth.service'; // <-- importa el servicio

bootstrapApplication(AppRoot, appConfig)
  .then(ref => {
    // Exponer para la consola:
    (window as any).injector = ref.injector;
    (window as any).AuthService = AuthService;
  })
  .catch(err => console.error(err));
