import express from 'express';
import { register, login, getProfile, updatePreferences } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticate as any, getProfile);
router.put('/preferences', authenticate as any, updatePreferences);

export default router;
