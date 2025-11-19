import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthService } from './core/services/auth.service';

describe('AppComponent', () => {
  let authState$: BehaviorSubject<any>;

  beforeEach(async () => {
    authState$ = new BehaviorSubject<any>(null);
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, AppComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            authState$: authState$.asObservable(),
            isAuthenticated: () => Boolean(authState$.value?.token)
          }
        }
      ]
    }).compileComponents();
  });

  it('should create the app shell', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('shows only Auth navigation when unauthenticated', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(compiled.querySelectorAll('nav a')).map((a) => a.textContent?.trim());
    expect(links).toEqual(['Auth']);
    expect(compiled.querySelector('.user-chip')).toBeNull();
  });

  it('shows app navigation after login', () => {
    authState$.next({ token: 'jwt-token', user: { email: 'demo@example.com' } });
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('nav a');
    expect(Array.from(links).map((a) => a.textContent?.trim())).toEqual([
      'Dashboard',
      'Jobs',
      'Admin',
      'Menu'
    ]);
    expect(compiled.querySelector('.user-chip')?.textContent?.trim()).toBe('demo@example.com');
  });
});
