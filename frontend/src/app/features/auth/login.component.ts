import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  error: string | null = null;
  successEmail: string | null = null;
  mode: 'login' | 'register' = 'login';

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit(): void {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    this.error = null;
    this.successEmail = null;

    const submit$ =
      this.mode === 'register'
        ? this.authService.register(this.form.getRawValue())
        : this.authService.login(this.form.getRawValue());

    submit$
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          this.successEmail = response.user.email;
          void this.router.navigate(['/dashboard']);
        },
        error: (error: Error) => {
          this.error = error.message || 'Login failed';
        }
      });
  }

  register(): void {
    this.mode = 'register';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Please enter a valid email and password (min 8 chars).';
      return;
    }
    this.submit();
  }
}
