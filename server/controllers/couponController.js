import asyncHandler from 'express-async-handler';
import Coupon from '../models/couponModel.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

const getActiveCouponQuery = () => ({
  isActive: true,
  expiry: { $gt: new Date() },
});

const getActiveCouponProjection = 'name discount expiry isActive createdAt';

const buildCouponEmailHtml = (coupon) => `
  <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background: #ffffff;">
    <div style="font-size: 12px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #2563eb; margin-bottom: 12px;">FlitStore Offer</div>
    <h2 style="margin: 0 0 12px; font-size: 28px; line-height: 1.2; color: #111827;">${coupon.name} is now live</h2>
    <p style="margin: 0 0 16px; font-size: 16px; color: #374151;">Get ${coupon.discount}% off on your next order. This offer is active until ${new Date(coupon.expiry).toLocaleDateString()}.</p>
    <div style="display: inline-block; padding: 12px 18px; background: #111827; color: #ffffff; border-radius: 999px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 16px;">Code: ${coupon.name}</div>
    <p style="margin: 0; font-size: 14px; color: #6b7280;">Use it at checkout before it expires.</p>
  </div>
`;

const notifyUsersAboutCoupon = async (coupon) => {
  const users = await User.find({ isVerified: true }).select('email name');

  if (!users.length) {
    return { notified: 0 };
  }

  const mailJobs = users.map((user) =>
    sendEmail({
      email: user.email,
      subject: `New FlitStore coupon: ${coupon.name}`,
      message: `Your coupon code ${coupon.name} is now active and gives ${coupon.discount}% off.`,
      html: buildCouponEmailHtml(coupon),
    })
  );

  const results = await Promise.allSettled(mailJobs);
  const notified = results.filter((result) => result.status === 'fulfilled').length;

  return { notified };
};

// @desc    Get currently active coupon for all users
// @route   GET /api/coupons/active
// @access  Public
export const getActiveCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne(getActiveCouponQuery())
    .sort({ createdAt: -1 })
    .select(getActiveCouponProjection);

  res.json(coupon || null);
});

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
    isActive: true,
  });

  try {
    await notifyUsersAboutCoupon(coupon);
  } catch (error) {
    console.error('Coupon email notification failed:', error.message);
  }

  res.status(201).json(coupon);
});

// @desc    Toggle coupon active state
// @route   PATCH /api/coupons/:id/active
// @access  Private/Admin
export const updateCouponActiveStatus = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  const previousState = coupon.isActive;

  if (typeof req.body.isActive === 'boolean') {
    coupon.isActive = req.body.isActive;
  } else {
    coupon.isActive = !coupon.isActive;
  }

  const updatedCoupon = await coupon.save();

  if (!previousState && updatedCoupon.isActive) {
    try {
      await notifyUsersAboutCoupon(updatedCoupon);
    } catch (error) {
      console.error('Coupon activation email notification failed:', error.message);
    }
  }

  res.json(updatedCoupon);
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