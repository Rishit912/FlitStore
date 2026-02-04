const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered, // 👈 Import it
  getOrders,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Route for getting all orders (List)
router.route('/')
    .post(protect, addOrderItems)
    .get(protect, getOrders);

// Route for "Mark as Delivered" 
// (I kept it protected but removed 'admin' check so it works for you immediately)
router.route('/:id/deliver').put(protect, updateOrderToDelivered); 

router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);

module.exports = router;