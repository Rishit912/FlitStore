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
} from '../controllers/productController.js';

import { protect, admin } from '../middleware/authMiddleware.js';

// --- SUGGESTIONS ROUTE ---
router.route('/suggestions').get(getProductSuggestions);

// --- BASE ROUTES ---
router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

// --- REVIEW ROUTE ---
// 🟢 New route for adding product reviews
router.route('/:id/reviews').post(protect, createProductReview);

// --- ID ROUTES ---
router.route('/:id')
  .get(getProductById)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct);

export default router;