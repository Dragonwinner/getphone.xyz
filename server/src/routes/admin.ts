import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  createPhone,
  updatePhone,
  deletePhone
} from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate as any);
router.use(requireAdmin as any);

// Dashboard
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.put('/users/:userId/status', updateUserStatus);

// Phone management
router.post('/phones', createPhone);
router.put('/phones/:phoneId', updatePhone);
router.delete('/phones/:phoneId', deletePhone);

export default router;
