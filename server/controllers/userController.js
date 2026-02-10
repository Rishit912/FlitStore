import asyncHandler from '../middleware/asyncHandler.js';
import crypto from 'crypto';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & send OTP for verification (2FA)
// @route   POST /api/users/login
export const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // 1. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = new Date(Date.now() + 10 * 60 * 1000); 
    await user.save();

    // 2. Send Email
    await sendEmail({
      email: user.email,
      subject: 'Login Verification',
      message: `Your OTP is: ${otp}`,
    });

    // 3. Response for Frontend
    res.json({
      navigateVerify: true,
      email: user.email,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register new user & send OTP
// @route   POST /api/users
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpire = new Date(Date.now() + 10 * 60 * 1000); 

  const user = await User.create({
    name,
    email,
    password,
    otp,
    otpExpire,
    isVerified: false,
  });

  if (user) {
    try {
      await sendEmail({
        email: user.email,
        subject: 'FlitStore Verification Code',
        message: `Your OTP is: ${otp}. It expires in 10 minutes.`,
      });

      res.status(201).json({
        name: user.name,
        email: user.email,
        message: 'OTP sent to email',
      });
    } catch (error) {
      await User.findByIdAndDelete(user._id);
      res.status(500);
      throw new Error('Email failed to send. User not created.');
    }
  }
});

// @desc    Verify OTP and log user in
// @route   POST /api/users/verify
export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.otp === otp && user.otpExpire > Date.now()) {
    user.isVerified = true;
    user.otp = undefined; 
    user.otpExpire = undefined;
    await user.save();

    // Set JWT in HTTP-Only Cookie upon successful verification
    generateToken(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }
});

// @desc    Resend OTP
export const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpire = new Date(Date.now() + 60 * 60 * 1000); 

  await User.updateOne(
    { _id: user._id },
    { $set: { otp, otpExpire } }
  );

  try {
    await sendEmail({
      email: user.email,
      subject: 'FlitStore - New Verification Code',
      message: `Your new OTP is: ${otp}`,
    });
    res.json({ message: 'New OTP sent to your email' });
  } catch (error) {
    res.status(500);
    throw new Error('Email failed to send');
  }
});

// @desc    Send password reset email
// @route   POST /api/users/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  const resetTokenHash = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  user.resetPasswordToken = resetTokenHash;
  user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
      <h2 style="color: #2563eb;">Reset your password</h2>
      <p>We received a request to reset your FlitStore password.</p>
      <p><a href="${resetUrl}" style="background: #2563eb; color: #fff; padding: 10px 16px; border-radius: 6px; text-decoration: none;">Reset Password</a></p>
      <p>If the button does not work, copy this link:</p>
      <p style="word-break: break-all;">${resetUrl}</p>
      <p style="font-size: 12px; color: #666;">This link expires in 10 minutes.</p>
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject: 'FlitStore Password Reset',
    message: `Reset your password: ${resetUrl}`,
    html: emailHtml,
  });

  res.json({ message: 'Password reset link sent to email' });
});

// @desc    Reset password using token
// @route   PUT /api/users/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password || password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const resetTokenHash = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: resetTokenHash,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  generateToken(res, user._id);

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
  });
});

// @desc    Logout user & clear cookie
export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Get user profile
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }
    const updatedUser = await user.save();
    generateToken(res, updatedUser._id);
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get saved addresses
// @route   GET /api/users/addresses
// @access  Private
export const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('addresses');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user.addresses || []);
});

// @desc    Add a new address
// @route   POST /api/users/addresses
// @access  Private
export const addAddress = asyncHandler(async (req, res) => {
  const { label, address, city, postalCode, country, phone, isDefault } = req.body;

  if (!address || !city || !postalCode || !country) {
    res.status(400);
    throw new Error('Address, city, postal code, and country are required');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (isDefault) {
    user.addresses = (user.addresses || []).map((item) => ({
      ...item.toObject(),
      isDefault: false,
    }));
  }

  user.addresses.push({
    label: label || 'Home',
    address,
    city,
    postalCode,
    country,
    phone,
    isDefault: Boolean(isDefault),
  });

  await user.save();
  res.status(201).json(user.addresses);
});

// @desc    Update an address
// @route   PUT /api/users/addresses/:id
// @access  Private
export const updateAddress = asyncHandler(async (req, res) => {
  const { label, address, city, postalCode, country, phone, isDefault } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const addressDoc = user.addresses.id(req.params.id);
  if (!addressDoc) {
    res.status(404);
    throw new Error('Address not found');
  }

  if (isDefault) {
    user.addresses = user.addresses.map((item) => ({
      ...item.toObject(),
      isDefault: false,
    }));
  }

  if (label !== undefined) addressDoc.label = label || 'Home';
  if (address !== undefined) addressDoc.address = address;
  if (city !== undefined) addressDoc.city = city;
  if (postalCode !== undefined) addressDoc.postalCode = postalCode;
  if (country !== undefined) addressDoc.country = country;
  if (phone !== undefined) addressDoc.phone = phone;
  if (isDefault !== undefined) addressDoc.isDefault = Boolean(isDefault);

  await user.save();
  res.json(user.addresses);
});

// @desc    Delete an address
// @route   DELETE /api/users/addresses/:id
// @access  Private
export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const addressDoc = user.addresses.id(req.params.id);
  if (!addressDoc) {
    res.status(404);
    throw new Error('Address not found');
  }

  addressDoc.deleteOne();
  await user.save();
  res.json(user.addresses);
});

// @desc    Get wishlist
// @route   GET /api/users/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name price image countInStock');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user.wishlist || []);
});

// @desc    Add product to wishlist
// @route   POST /api/users/wishlist
// @access  Private
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    res.status(400);
    throw new Error('Product ID is required');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const exists = (user.wishlist || []).some((item) => String(item) === String(productId));
  if (!exists) {
    user.wishlist = [...(user.wishlist || []), productId];
    await user.save();
  }

  const populated = await User.findById(req.user._id).populate('wishlist', 'name price image countInStock');
  res.status(201).json(populated.wishlist || []);
});

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.wishlist = (user.wishlist || []).filter((item) => String(item) !== String(productId));
  await user.save();

  const populated = await User.findById(req.user._id).populate('wishlist', 'name price image countInStock');
  res.json(populated.wishlist || []);
});

// @desc    Get notifications
// @route   GET /api/users/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('notifications');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user.notifications || []);
});

// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:id/read
// @access  Private
export const markNotificationRead = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const notification = user.notifications.id(req.params.id);
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  notification.isRead = true;
  await user.save();
  res.json(user.notifications || []);
});

// @desc    Clear all notifications
// @route   DELETE /api/users/notifications
// @access  Private
export const clearNotifications = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.notifications = [];
  await user.save();
  res.json([]);
});

// @desc    Get all users (Admin only)
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error('Cannot delete admin user');
    }
    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User deleted successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
