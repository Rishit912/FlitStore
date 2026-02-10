import express from 'express';
const router = express.Router();

// 🟢 Using Destructured Imports with .js extensions
import {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  getProductSuggestions,
  createProductReview, // 🟢 Added for the new review feature
  getLowStockProducts,
  getPendingReviews,
  approveReview,
  replyReview,
  rejectReview,
} from '../controllers/productController.js';

import { protect, admin } from '../middleware/authMiddleware.js';

// --- SUGGESTIONS ROUTE ---
router.route('/suggestions').get(getProductSuggestions);
router.route('/low-stock').get(protect, admin, getLowStockProducts);
router.route('/reviews/pending').get(protect, admin, getPendingReviews);

// --- BASE ROUTES ---
router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

// --- REVIEW ROUTE ---
// 🟢 New route for adding product reviews
router.route('/:id/reviews').post(protect, createProductReview);

router.route('/:id/reviews/:reviewId/approve').put(protect, admin, approveReview);
router.route('/:id/reviews/:reviewId/reply').put(protect, admin, replyReview);
router.route('/:id/reviews/:reviewId/reject').delete(protect, admin, rejectReview);

// --- ID ROUTES ---
router.route('/:id')
  .get(getProductById)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct);

export default router;