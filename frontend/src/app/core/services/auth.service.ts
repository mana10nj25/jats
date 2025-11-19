import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import type {
  AuthCredentials,
  AuthResponse,
  AuthUser,
  TwoFactorSetupResponse,
  TwoFactorVerifyRequest,
  TwoFactorVerifyResponse
} from '../models/auth.model';
import { AuthApiService } from './auth-api.service';
import { TokenStorageService } from './token-storage.service';

export type AuthState = { token: string; user: AuthUser | null } | null;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(AuthApiService);
  private readonly storage = inject(TokenStorageService);
  private readonly authStateSubject = new BehaviorSubject<AuthState>(this.hydrateInitialState());

  readonly authState$ = this.authStateSubject.asObservable();

  register(credentials: AuthCredentials): Observable<AuthResponse> {
    return this.api.register(credentials).pipe(
      tap((response) => {
        this.storage.setToken(response.token);
        this.authStateSubject.next({ token: response.token, user: response.user });
      })
    );
  }

  login(credentials: AuthCredentials): Observable<AuthResponse> {
    return this.api.login(credentials).pipe(
      tap((response) => {
        this.storage.setToken(response.token);
        this.authStateSubject.next({ token: response.token, user: response.user });
      })
    );
  }

  logout(): void {
    this.storage.clear();
    this.authStateSubject.next(null);
  }

  isAuthenticated(): boolean {
    return Boolean(this.authStateSubject.value?.token);
  }

  setupTwoFactor(): Observable<TwoFactorSetupResponse> {
    return this.api.setupTwoFactor();
  }

  verifyTwoFactor(payload: TwoFactorVerifyRequest): Observable<TwoFactorVerifyResponse> {
    return this.api.verifyTwoFactor(payload);
  }

  private hydrateInitialState(): AuthState {
    const token = this.storage.getToken();
    if (!token) {
      return null;
    }
    return { token, user: null };
  }
}
