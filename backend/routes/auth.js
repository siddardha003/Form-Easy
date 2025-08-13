import express from 'express';
import {
  register,
  login,
  googleAuth,
  getMe,
  logout,
  refreshToken
} from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
  validateGoogleAuth
} from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/google', validateGoogleAuth, googleAuth);

// Protected routes
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);
router.post('/refresh', authenticate, refreshToken);

export default router;