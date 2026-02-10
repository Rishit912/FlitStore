// server/routes/couponRoutes.js
import express from 'express';
const router = express.Router();
import { 
  validateCoupon, 
  createCoupon, 
  getCoupons, 
  deleteCoupon 
} from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/')
  .get(protect, admin, getCoupons)
  .post(protect, admin, createCoupon);

router.route('/validate').post(protect, validateCoupon);
router.route('/:id').delete(protect, admin, deleteCoupon);

export default router;