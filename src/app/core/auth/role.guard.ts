import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import type { Role } from './roles';
import { roleHome } from './roles';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowed = (route.data?.['roles'] as Role[]) ?? [];
  const r = auth.role();
  if (r && allowed.includes(r)) return true;
  return auth.isLogged() ? router.parseUrl(roleHome(r ?? 'DIRECTOR')) : router.parseUrl('/login');
};
