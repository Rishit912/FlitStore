import express from 'express';
const router = express.Router();

// Import using destructuring and the .js extension
import {
  authUser,
  registerUser,
  verifyOTP,
  logoutUser,
  resendOTP,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  requestPasswordReset,
  resetPassword,
} from '../controllers/userController.js';
// Password reset
router.post('/reset-password', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);

import { protect, admin } from '../middleware/authmiddleware.js';

// Define your routes
router.post('/login', authUser);
router.post('/verify', verifyOTP);
router.post('/resend-otp', resendOTP);
router.route('/').post(registerUser).get(protect, admin, getUsers);
router.post('/logout', logoutUser);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.route('/:id').delete(protect, admin, deleteUser);

export default router;