import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { AuthResponse, TwoFactorSetupResponse } from '../models/auth.model';
import { TokenStorageService } from './token-storage.service';
import { AuthApiService } from './auth-api.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let api: jasmine.SpyObj<AuthApiService>;
  let storage: jasmine.SpyObj<TokenStorageService>;

  beforeEach(() => {
    api = jasmine.createSpyObj<AuthApiService>('AuthApiService', [
      'register',
      'login',
      'setupTwoFactor',
      'verifyTwoFactor'
    ]);
    storage = jasmine.createSpyObj<TokenStorageService>('TokenStorageService', [
      'getToken',
      'setToken',
      'clear'
    ]);
    storage.getToken.and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthApiService, useValue: api },
        { provide: TokenStorageService, useValue: storage }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  it('logs in, stores the token, and emits auth state', () => {
    const loginResponse: AuthResponse = {
      token: 'jwt-token',
      user: { id: 'user-1', email: 'demo@example.com' }
    };
    api.login.and.returnValue(of(loginResponse));

    let latestUserEmail: string | undefined;
    service.authState$.subscribe((state) => (latestUserEmail = state?.user?.email));

    service.login({ email: 'demo@example.com', password: 'password123' }).subscribe();

    expect(api.login).toHaveBeenCalledWith({ email: 'demo@example.com', password: 'password123' });
    expect(storage.setToken).toHaveBeenCalledWith('jwt-token');
    expect(latestUserEmail).toBe('demo@example.com');
  });

  it('clears auth state on logout', () => {
    api.login.and.returnValue(
      of({
        token: 'jwt-token',
        user: { id: 'user-1', email: 'demo@example.com' }
      })
    );

    let latestToken: string | undefined;
    service.authState$.subscribe((state) => (latestToken = state?.token));

    service.login({ email: 'demo@example.com', password: 'password123' }).subscribe();
    service.logout();

    expect(storage.clear).toHaveBeenCalled();
    expect(latestToken).toBeUndefined();
  });

  it('exposes 2FA setup results', () => {
    const setupResponse: TwoFactorSetupResponse = {
      secret: 'ABC123',
      qr: 'data:image/png;base64,abc'
    };
    api.setupTwoFactor.and.returnValue(of(setupResponse));

    let latest: TwoFactorSetupResponse | undefined;
    service.setupTwoFactor().subscribe((response) => (latest = response));

    expect(api.setupTwoFactor).toHaveBeenCalled();
    expect(latest).toEqual(setupResponse);
  });

  it('surfaces login errors without mutating storage', () => {
    api.login.and.returnValue(throwError(() => new Error('Unauthorized')));

    let errorMessage: string | undefined;
    service
      .login({ email: 'demo@example.com', password: 'wrong' })
      .subscribe({ error: (error) => (errorMessage = error.message) });

    expect(storage.setToken).not.toHaveBeenCalled();
    expect(errorMessage).toContain('Unauthorized');
  });

  it('registers, stores the token, and emits auth state', () => {
    const registerResponse: AuthResponse = {
      token: 'jwt-token',
      user: { id: 'user-2', email: 'new@example.com' }
    };
    api.register.and.returnValue(of(registerResponse));

    let latestUserEmail: string | undefined;
    service.authState$.subscribe((state) => (latestUserEmail = state?.user?.email));

    service.register({ email: 'new@example.com', password: 'Password123' }).subscribe();

    expect(api.register).toHaveBeenCalledWith({ email: 'new@example.com', password: 'Password123' });
    expect(storage.setToken).toHaveBeenCalledWith('jwt-token');
    expect(latestUserEmail).toBe('new@example.com');
  });
});
