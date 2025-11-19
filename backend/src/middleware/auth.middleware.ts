import type { NextFunction, Request, Response } from 'express';
import { verifyAuthToken, type AuthTokenPayload } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    email?: string;
    token: string;
  };
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Response | void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing token' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const payload: AuthTokenPayload = verifyAuthToken(token);
    req.auth = {
      userId: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      token
    };
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
