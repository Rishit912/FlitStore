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
  getProductCategories,
  getProductBrands,
  getBestSellerProducts,
  getRetailerSummary,
  getMyProducts,
  createMyProduct,
  updateMyProduct,
  deleteMyProduct,
  createProductReview, // 🟢 Added for the new review feature
  deleteProductReview,
} from '../controllers/productController.js';

import { protect, admin } from '../middleware/authmiddleware.js';

// --- SUGGESTIONS ROUTE ---
router.route('/suggestions').get(getProductSuggestions);

// --- CATEGORIES ROUTE ---
router.route('/categories').get(getProductCategories);

// --- BRANDS ROUTE ---
router.route('/brands').get(getProductBrands);

// --- FEATURED ROUTES ---
router.route('/best-sellers').get(getBestSellerProducts);
router.route('/retailer/summary').get(protect, getRetailerSummary);
router.route('/my-products').get(protect, getMyProducts).post(protect, createMyProduct);
router.route('/my-products/:id').put(protect, updateMyProduct).delete(protect, deleteMyProduct);

// --- BASE ROUTES ---
router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

// --- REVIEW ROUTE ---
// 🟢 New route for adding product reviews
router.route('/:id/reviews').post(protect, createProductReview);
router.route('/:id/reviews/:reviewId').delete(protect, deleteProductReview);

// --- ID ROUTES ---
router.route('/:id')
  .get(getProductById)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct);

export default router;