// src/app/core/http/errors.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const errorsInterceptor: HttpInterceptorFn = (req, next) => {
  // Interceptor en blanco: no altera la request ni maneja errores.
  return next(req);
};
