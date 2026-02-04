
const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct, 
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// Route for /api/products
router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

// Route for /api/products/:id
router.route('/:id')
  .get(getProductById)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct); 

module.exports = router;