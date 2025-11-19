import { Router } from 'express';
import { login, register, setupTwoFactor, verifyTwoFactor } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/2fa/setup', authenticate, setupTwoFactor);
router.post('/2fa/verify', authenticate, verifyTwoFactor);

export default router;
