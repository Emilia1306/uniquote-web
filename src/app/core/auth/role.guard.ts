import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlSegment } from '@angular/router';
import { AuthService } from './auth.service';
import type { Role } from './roles';
import { roleHome } from './roles';

export function roleGuard(allowed: Role[] = []): CanMatchFn {
  return async (_route, _segments: UrlSegment[]) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    // 👇 Asegura sesión cargada ANTES de chequear rol
    await auth.loadMeOnce();

    const me  = auth.user();
    if (!me) {
      return router.createUrlTree(['/login']);
    }

    const rol = me.role;
    if (allowed.length === 0 || allowed.includes(rol)) {
      return true;
    }

    return router.createUrlTree([roleHome(rol)]);
  };
}
