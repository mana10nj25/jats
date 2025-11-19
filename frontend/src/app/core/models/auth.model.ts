export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qr: string;
}

export interface TwoFactorVerifyRequest {
  token: string;
  secret?: string;
}

export interface TwoFactorVerifyResponse {
  message: string;
}
