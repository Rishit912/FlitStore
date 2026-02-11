import express from 'express';
const router = express.Router();

// 🟢 Using ES Module imports with .js extensions
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  cancelOrder,
  updateOrderRefund,
  requestOrderReturn,
  updateReturnRefund,
  regenerateTrackingToken,
  getTrackingStatus,
  getOrders,
  getMyOrders, // 🟢 Ensure this is imported for the Profile History
  getAiDiscountSummary,
} from '../controllers/orderController.js';

import { protect, admin } from '../middleware/authmiddleware.js';

// --- USER ROUTES ---
// 🟢 This MUST be above /:id to avoid 404/ID conflicts
router.route('/myorders').get(protect, getMyOrders);
router.route('/ai-discounts').get(protect, admin, getAiDiscountSummary);
router.route('/track/:token').get(getTrackingStatus);

// --- BASE ROUTES ---
router.route('/')
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders); // Admin can view all orders

// --- SPECIFIC ORDER ROUTES ---
router.route('/:id/cancel').put(protect, cancelOrder);
router.route('/:id/refund').put(protect, admin, updateOrderRefund);
router.route('/:id/return').put(protect, requestOrderReturn);
router.route('/:id/return/refund').put(protect, admin, updateReturnRefund);
router.route('/:id/tracking-token').put(protect, admin, regenerateTrackingToken);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);

export default router; // 🟢 Proper ES Module export