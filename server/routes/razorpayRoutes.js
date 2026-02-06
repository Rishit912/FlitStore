import express from 'express';
const router = express.Router();
import { createRazorpayOrder } from '../controllers/razorpayController.js';
import { protect } from '../middleware/authMiddleware.js';

// This handles the POST request from your OrderScreen
router.route('/').post(protect, createRazorpayOrder);

export default router;