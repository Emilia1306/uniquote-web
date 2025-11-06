import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { roleHome } from './roles';

export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.loadMeOnce();
  return auth.isLogged() ? router.parseUrl(roleHome(auth.role()!)) : true;
};
