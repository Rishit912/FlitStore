// server/routes/couponRoutes.js
import express from 'express';
const router = express.Router();
import { 
  getActiveCoupon,
  validateCoupon, 
  createCoupon, 
  getCoupons, 
  deleteCoupon,
  updateCouponActiveStatus 
} from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authmiddleware.js';

router.route('/active').get(getActiveCoupon);

router.route('/')
  .get(protect, admin, getCoupons)
  .post(protect, admin, createCoupon);

router.route('/validate').post(protect, validateCoupon);
router.route('/:id').delete(protect, admin, deleteCoupon);
router.route('/:id/active').patch(protect, admin, updateCouponActiveStatus);

export default router;