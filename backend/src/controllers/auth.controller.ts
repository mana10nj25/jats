import type { Response } from 'express';
import Joi from 'joi';
import QRCode from 'qrcode';
import { authenticator } from 'otplib';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { UserModel } from '../models/user.model';
import { signAuthToken } from '../utils/jwt';
import { hashPassword, verifyPassword } from '../utils/password';

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

const verifyTwoFASchema = Joi.object({
  token: Joi.string().length(6).required(),
  secret: Joi.string().optional()
});

export async function register(req: AuthenticatedRequest, res: Response): Promise<Response> {
  const { value, error } = registerSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({ message: 'Validation failed', details: error.details });
  }

  const normalizedEmail = value.email.toLowerCase();
  const existingUser = await UserModel.findOne({ email: normalizedEmail });

  if (existingUser) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const passwordHash = await hashPassword(value.password);
  const user = await UserModel.create({
    email: normalizedEmail,
    passwordHash
  });

  const token = signAuthToken({ sub: user.id, email: user.email });

  return res.status(201).json({
    token,
    user: { id: user.id, email: user.email }
  });
}

export async function login(req: AuthenticatedRequest, res: Response): Promise<Response> {
  const { value, error } = loginSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({ message: 'Validation failed', details: error.details });
  }

  const normalizedEmail = value.email.toLowerCase();
  const user = await UserModel.findOne({ email: normalizedEmail });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const passwordMatch = await verifyPassword(value.password, user.passwordHash);

  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signAuthToken({ sub: user.id, email: user.email });

  return res.json({
    token,
    user: { id: user.id, email: user.email }
  });
}

export async function setupTwoFactor(req: AuthenticatedRequest, res: Response): Promise<Response> {
  if (!req.auth?.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await UserModel.findById(req.auth.userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const secret = authenticator.generateSecret();
  user.twoFASecret = secret;
  await user.save();

  const otpauth = authenticator.keyuri(user.email, 'JATS', secret);
  const qr = await QRCode.toDataURL(otpauth);

  return res.json({
    secret,
    qr
  });
}

export async function verifyTwoFactor(req: AuthenticatedRequest, res: Response): Promise<Response> {
  if (!req.auth?.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { value, error } = verifyTwoFASchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({ message: 'Validation failed', details: error.details });
  }

  const user = await UserModel.findById(req.auth.userId);

  if (!user || !user.twoFASecret) {
    return res.status(400).json({ message: '2FA not configured' });
  }

  const secret = value.secret ?? user.twoFASecret;
  const isValid = authenticator.verify({ token: value.token, secret });

  if (!isValid) {
    return res.status(400).json({ message: 'Invalid token' });
  }

  return res.json({ message: '2FA verified' });
}
