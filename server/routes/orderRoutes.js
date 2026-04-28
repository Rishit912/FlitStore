import express from 'express';
const router = express.Router();

// 🟢 Using ES Module imports with .js extensions
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
  getDashboardSummary,
  getMyOrders,
  getRetailerOrders,
  getRetailerReviews,
  getRetailerAnalytics,
  updateOrderFulfillment,
} from '../controllers/orderController.js';

import { protect, admin } from '../middleware/authmiddleware.js';

// --- USER ROUTES ---
// 🟢 This MUST be above /:id to avoid 404/ID conflicts
router.route('/myorders').get(protect, getMyOrders);
router.route('/summary').get(protect, admin, getDashboardSummary);

// --- RETAILER ROUTES ---
router.route('/retailer/orders').get(protect, getRetailerOrders);
router.route('/retailer/reviews').get(protect, getRetailerReviews);
router.route('/retailer/analytics').get(protect, getRetailerAnalytics);

// --- BASE ROUTES ---
router.route('/')
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders); // Admin can view all orders

// --- SPECIFIC ORDER ROUTES ---
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/fulfillment').put(protect, updateOrderFulfillment);

export default router; // 🟢 Proper ES Module export