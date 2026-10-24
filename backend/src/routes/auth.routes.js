import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  changePassword,
} from '../controllers/auth.controller.js';
import { authenticate, authRateLimiter } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from '../validations/auth.validation.js';

const router = Router();

// Public routes with rate limiting
router.post('/register', authRateLimiter, validateBody(registerSchema), register);
router.post('/login', authRateLimiter, validateBody(loginSchema), login);
router.post('/logout', logout);

// Protected routes requiring valid JWT session
router.get('/me', authenticate, getMe);
router.patch(
  '/change-password',
  authenticate,
  validateBody(changePasswordSchema),
  changePassword
);

export default router;
