import { Injectable } from '@angular/core';

const STORAGE_KEY = 'jats.auth.token';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return window.localStorage.getItem(STORAGE_KEY);
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, token);
  }

  clear(): void {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.removeItem(STORAGE_KEY);
  }
}
