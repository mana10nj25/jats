import { UrlSegment, UrlTree } from '@angular/router';
import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('authGuard', () => {
  it('allows navigation when authenticated', () => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: AuthService, useValue: { isAuthenticated: () => true } }]
    });

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, [] as UrlSegment[]));
    expect(result).toBeTrue();
  });

  it('redirects to /auth when not authenticated', () => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: AuthService, useValue: { isAuthenticated: () => false } }]
    });

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, [] as UrlSegment[]));
    expect((result as UrlTree).toString()).toBe('/auth');
  });
});

describe('guestGuard', () => {
  it('redirects authenticated users to dashboard', () => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: AuthService, useValue: { isAuthenticated: () => true } }]
    });

    const result = TestBed.runInInjectionContext(() => guestGuard({} as any, [] as UrlSegment[]));
    expect((result as UrlTree).toString()).toBe('/dashboard');
  });

  it('allows guests to proceed', () => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: AuthService, useValue: { isAuthenticated: () => false } }]
    });

    const result = TestBed.runInInjectionContext(() => guestGuard({} as any, [] as UrlSegment[]));
    expect(result).toBeTrue();
  });
});
