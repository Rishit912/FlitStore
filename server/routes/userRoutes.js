import express from 'express';
const router = express.Router();

// Import using destructuring and the .js extension
import {
  authUser,
  registerUser,
  verifyOTP,
  logoutUser,
  resendOTP,
  forgotPassword,
  resetPassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getNotifications,
  markNotificationRead,
  clearNotifications,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
} from '../controllers/userController.js';

import { protect, admin } from '../middleware/authMiddleware.js';

// Define your routes
router.post('/login', authUser);
router.post('/verify', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.route('/addresses').get(protect, getAddresses).post(protect, addAddress);
router.route('/addresses/:id').put(protect, updateAddress).delete(protect, deleteAddress);
router.route('/wishlist').get(protect, getWishlist).post(protect, addToWishlist);
router.route('/wishlist/:productId').delete(protect, removeFromWishlist);
router.route('/notifications').get(protect, getNotifications).delete(protect, clearNotifications);
router.route('/notifications/:id/read').put(protect, markNotificationRead);
router.route('/').post(registerUser).get(protect, admin, getUsers);
router.post('/logout', logoutUser);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.route('/:id').delete(protect, admin, deleteUser);

export default router;