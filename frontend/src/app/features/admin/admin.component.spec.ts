import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { AdminComponent } from './admin.component';
import { AuthService } from '../../core/services/auth.service';

describe('AdminComponent', () => {
  let fixture: ComponentFixture<AdminComponent>;
  let authState$: BehaviorSubject<any>;

  beforeEach(async () => {
    authState$ = new BehaviorSubject({ token: 'jwt', user: { email: 'demo@example.com' } });
    await TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            authState$: authState$.asObservable(),
            isAuthenticated: () => true,
            setupTwoFactor: () => of({ secret: 'ABC123', qr: 'data:image/png;base64,abc' }),
            verifyTwoFactor: () => of({ message: '2FA verified' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();
  });

  it('renders admin heading and two-factor settings', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Admin Settings');
    expect(compiled.querySelector('app-two-factor')).toBeTruthy();
  });
});
