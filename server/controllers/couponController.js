import asyncHandler from 'express-async-handler';
import Coupon from '../models/couponModel.js';

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;

  // Find a coupon that is active and matches the code
  const coupon = await Coupon.findOne({ name: code.toUpperCase(), isActive: true });

  if (coupon) {
    // Check if the current date is before the expiry date
    if (coupon.expiry > new Date()) {
      res.json({ discount: coupon.discount });
    } else {
      res.status(400);
      throw new Error('Coupon has expired');
    }
  } else {
    res.status(400);
    throw new Error('Invalid coupon code');
  }
});


// server/controllers/couponController.js

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = asyncHandler(async (req, res) => {
  const { name, discount, expiry } = req.body;

  const couponExists = await Coupon.findOne({ name });
  if (couponExists) {
    res.status(400);
    throw new Error('Coupon code already exists');
  }

  const coupon = await Coupon.create({
    name,
    discount,
    expiry,
  });

  res.status(201).json(coupon);
});

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({});
  res.json(coupons);
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (coupon) {
    await coupon.deleteOne();
    res.json({ message: 'Coupon removed' });
  } else {
    res.status(404);
    throw new Error('Coupon not found');
  }
});