import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.tokens';
import type {
  AuthCredentials,
  AuthResponse,
  TwoFactorSetupResponse,
  TwoFactorVerifyRequest,
  TwoFactorVerifyResponse
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = this.normalizeBaseUrl(inject(API_BASE_URL));

  register(credentials: AuthCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/auth/register`, credentials);
  }

  login(credentials: AuthCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/auth/login`, credentials);
  }

  setupTwoFactor(): Observable<TwoFactorSetupResponse> {
    return this.http.post<TwoFactorSetupResponse>(`${this.apiBaseUrl}/auth/2fa/setup`, {});
  }

  verifyTwoFactor(payload: TwoFactorVerifyRequest): Observable<TwoFactorVerifyResponse> {
    return this.http.post<TwoFactorVerifyResponse>(`${this.apiBaseUrl}/auth/2fa/verify`, payload);
  }

  private normalizeBaseUrl(url: string): string {
    if (url.endsWith('/')) {
      return url.replace(/\/+$/, '');
    }
    return url;
  }
}
