// src/app/core/http/jwt.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  const isApi      = req.url.startsWith(environment.apiUrl);
  const isLogin    = req.url.includes('/auth/login');
  // si luego agregas refresh/register, también exclúyelos:
  // const isRefresh  = req.url.includes('/auth/refresh');
  // const isRegister = req.url.includes('/auth/register');

  // Solo agrega Authorization para llamadas a TU API que NO sean públicas
  if (isApi && token && !isLogin /* && !isRefresh && !isRegister */) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req);
};
