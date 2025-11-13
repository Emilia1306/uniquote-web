import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const meReadyGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  await auth.loadMeOnce();  // espera que el user se cargue si hay token
  return true;
};
