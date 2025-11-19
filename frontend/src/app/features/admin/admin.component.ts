import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TwoFactorComponent } from '../auth/two-factor.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, TwoFactorComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {}
