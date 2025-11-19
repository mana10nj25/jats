import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { TwoFactorComponent } from './two-factor.component';
import { AuthService } from '../../core/services/auth.service';
import type { AuthState } from '../../core/services/auth.service';

describe('TwoFactorComponent', () => {
  let fixture: ComponentFixture<TwoFactorComponent>;
  let component: TwoFactorComponent;
  let authService: jasmine.SpyObj<AuthService>;
  let authState$: BehaviorSubject<AuthState>;

  beforeEach(waitForAsync(() => {
    authState$ = new BehaviorSubject<AuthState>(null);
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'setupTwoFactor',
      'verifyTwoFactor'
    ]);
    Object.defineProperty(authService, 'authState$', {
      get: () => authState$.asObservable()
    });

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, TwoFactorComponent],
      providers: [{ provide: AuthService, useValue: authService }]
    }).compileComponents();

    fixture = TestBed.createComponent(TwoFactorComponent);
    component = fixture.componentInstance;
  }));

  it('blocks 2FA setup until signed in', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Sign in to enable two-factor');
  });

  it('shows secret + QR after setup', () => {
    authState$.next({ token: 'jwt', user: { id: 'user-1', email: 'demo@example.com' } });
    authService.setupTwoFactor.and.returnValue(
      of({ secret: 'ABC123', qr: 'data:image/png;base64,abc' })
    );

    component.generateSecret();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(authService.setupTwoFactor).toHaveBeenCalled();
    expect(compiled.textContent).toContain('ABC123');
    const qrImg = compiled.querySelector('img');
    expect(qrImg?.getAttribute('src')).toContain('data:image/png;base64,abc');
  });

  it('submits verification tokens', () => {
    authState$.next({ token: 'jwt', user: { id: 'user-1', email: 'demo@example.com' } });
    authService.verifyTwoFactor.and.returnValue(of({ message: '2FA verified' }));

    component.verifyForm.setValue({ token: '123456', secret: '' });
    component.verify();
    fixture.detectChanges();

    expect(authService.verifyTwoFactor).toHaveBeenCalledWith({ token: '123456' });
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('2FA verified');
  });
});
