import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../config/api.tokens';
import { AuthApiService } from './auth-api.service';

describe('AuthApiService', () => {
  let service: AuthApiService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:4000/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: API_BASE_URL, useValue: baseUrl }]
    });

    service = TestBed.inject(AuthApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('registers a new user and returns token plus user', () => {
    const credentials = { email: 'new@example.com', password: 'SuperSecure123!' };
    let result: { token: string; user: { id: string; email: string } } | undefined;

    service.register(credentials).subscribe((response) => (result = response));

    const req = httpMock.expectOne(`${baseUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);

    req.flush({
      token: 'jwt-token',
      user: {
        id: 'user-1',
        email: credentials.email
      }
    });

    expect(result).toEqual({
      token: 'jwt-token',
      user: { id: 'user-1', email: credentials.email }
    });
  });

  it('logs in and returns token plus user', () => {
    const credentials = { email: 'demo@example.com', password: 'SuperSecure123!' };
    let result: { token: string; user: { id: string; email: string } } | undefined;

    service.login(credentials).subscribe((response) => (result = response));

    const req = httpMock.expectOne(`${baseUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);

    req.flush({
      token: 'jwt-token',
      user: {
        id: 'user-1',
        email: credentials.email
      }
    });

    expect(result).toEqual({
      token: 'jwt-token',
      user: { id: 'user-1', email: credentials.email }
    });
  });

  it('initiates 2FA and returns secret + QR code', () => {
    let payload: { secret: string; qr: string } | undefined;

    service.setupTwoFactor().subscribe((response) => (payload = response));

    const req = httpMock.expectOne(`${baseUrl}/auth/2fa/setup`);
    expect(req.request.method).toBe('POST');

    req.flush({ secret: 'ABC123', qr: 'data:image/png;base64,abc' });

    expect(payload).toEqual({ secret: 'ABC123', qr: 'data:image/png;base64,abc' });
  });

  it('verifies a 2FA token and returns message', () => {
    let message: string | undefined;

    service.verifyTwoFactor({ token: '123456' }).subscribe((response) => (message = response.message));

    const req = httpMock.expectOne(`${baseUrl}/auth/2fa/verify`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ token: '123456' });

    req.flush({ message: '2FA verified' });
    expect(message).toBe('2FA verified');
  });
});
