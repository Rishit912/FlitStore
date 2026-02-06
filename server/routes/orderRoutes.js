import express from 'express';
const router = express.Router();

// 🟢 Using ES Module imports with .js extensions
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
  getMyOrders, // 🟢 Ensure this is imported for the Profile History
} from '../controllers/orderController.js';

import { protect, admin } from '../middleware/authMiddleware.js';

// --- USER ROUTES ---
// 🟢 This MUST be above /:id to avoid 404/ID conflicts
router.route('/myorders').get(protect, getMyOrders);

// --- BASE ROUTES ---
router.route('/')
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders); // Admin can view all orders

// --- SPECIFIC ORDER ROUTES ---
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);

export default router; // 🟢 Proper ES Module export