import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly authService = inject(AuthService);

  readonly authState$ = this.authService.authState$;
  readonly isAuthenticated$ = this.authState$.pipe(map((state) => Boolean(state?.token)));
  readonly currentUserEmail$ = this.authState$.pipe(map((state) => state?.user?.email ?? null));
}
