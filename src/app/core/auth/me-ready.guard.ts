import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const meReadyGuard: CanActivateFn = async () => {
  await inject(AuthService).loadMeOnce();
  return true;
};
