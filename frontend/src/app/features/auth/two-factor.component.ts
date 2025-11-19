import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, finalize } from 'rxjs';
import type { AuthState } from '../../core/services/auth.service';
import { AuthService } from '../../core/services/auth.service';
import type { TwoFactorSetupResponse } from '../../core/models/auth.model';

@Component({
  selector: 'app-two-factor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './two-factor.component.html',
  styleUrl: './two-factor.component.scss'
})
export class TwoFactorComponent implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly subscriptions = new Subscription();

  isAuthenticated = false;
  userEmail: string | null = null;
  setupResult: TwoFactorSetupResponse | null = null;
  message: string | null = null;
  error: string | null = null;
  generating = false;
  verifying = false;

  readonly verifyForm = this.fb.nonNullable.group({
    token: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    secret: ['']
  });

  constructor() {
    const sub = this.authService.authState$.subscribe((state: AuthState) => {
      this.isAuthenticated = Boolean(state?.token);
      this.userEmail = state?.user?.email ?? null;
    });
    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  generateSecret(): void {
    if (!this.isAuthenticated || this.generating) {
      this.error = 'Sign in to enable two-factor';
      return;
    }

    this.generating = true;
    this.error = null;
    this.message = null;

    this.authService
      .setupTwoFactor()
      .pipe(finalize(() => (this.generating = false)))
      .subscribe({
        next: (response) => {
          this.setupResult = response;
        },
        error: (err: Error) => {
          this.error = err.message || 'Failed to generate two-factor secret';
        }
      });
  }

  verify(): void {
    if (!this.isAuthenticated || this.verifying || this.verifyForm.invalid) {
      if (!this.isAuthenticated) {
        this.error = 'Sign in to enable two-factor';
      }
      return;
    }

    const { token, secret } = this.verifyForm.getRawValue();
    const payload: { token: string; secret?: string } = { token };
    if (secret) {
      payload.secret = secret;
    } else if (this.setupResult?.secret) {
      payload.secret = this.setupResult.secret;
    }

    this.verifying = true;
    this.error = null;
    this.message = null;

    this.authService
      .verifyTwoFactor(payload)
      .pipe(finalize(() => (this.verifying = false)))
      .subscribe({
        next: (response) => {
          this.message = response.message;
        },
        error: (err: Error) => {
          this.error = err.message || 'Failed to verify token';
        }
      });
  }
}
