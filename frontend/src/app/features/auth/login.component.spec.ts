import { ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(waitForAsync(() => {
    authService = jasmine.createSpyObj<AuthService>(
      'AuthService',
      ['register', 'login', 'setupTwoFactor', 'verifyTwoFactor'],
      { authState$: of(null) }
    );

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, LoginComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: jasmine.createSpyObj<Router>('Router', ['navigate']) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  }));

  it('submits credentials to auth service and shows success text', () => {
    authService.login.and.returnValue(
      of({
        token: 'jwt',
        user: { id: 'user-1', email: 'demo@example.com' }
      })
    );

    component.form.setValue({
      email: 'demo@example.com',
      password: 'Password123!'
    });

    component.submit();
    fixture.detectChanges();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'demo@example.com',
      password: 'Password123!'
    });

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Signed in as demo@example.com');
  });

  it('shows an error message when login fails', () => {
    authService.login.and.returnValue(throwError(() => new Error('Invalid credentials')));
    component.form.setValue({
      email: 'demo@example.com',
      password: 'WrongPass123'
    });

    component.submit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Invalid credentials');
  });

  it('registers when CTA is used', () => {
    authService.register.and.returnValue(
      of({
        token: 'jwt',
        user: { id: 'user-2', email: 'new@example.com' }
      })
    );
    component.form.setValue({
      email: 'new@example.com',
      password: 'Password123!'
    });

    component.register();
    fixture.detectChanges();

    expect(authService.register).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'Password123!'
    });
  });
});
