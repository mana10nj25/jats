import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_URL } from '../config/api.tokens';
import { TokenStorageService } from '../services/token-storage.service';

const normalizeBaseUrl = (url: string): string =>
  url.endsWith('/') ? url.replace(/\/+$/, '') : url;

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const apiBaseUrl = normalizeBaseUrl(inject(API_BASE_URL));

  if (!req.url.startsWith(apiBaseUrl)) {
    return next(req);
  }

  const tokenStorage = inject(TokenStorageService);
  const token = tokenStorage.getToken();

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  );
};
