import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';

// @desc    Auth user & get OTP for login
// @route   POST /api/users/login
// @access  Public
export const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = new Date(Date.now() + 10 * 60 * 1000); 
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'Login Verification - FlitStore',
      message: `Your OTP is: ${otp}`,
    });

    res.json({ navigateVerify: true, email: user.email });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user (Customer or Retailer)
// @route   POST /api/users
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, isRetailer } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpire = new Date(Date.now() + 10 * 60 * 1000); 

  // 🟢 Explicitly set isRetailer based on request
  const user = await User.create({ 
    name, 
    email, 
    password, 
    isRetailer: !!isRetailer, 
    otp, 
    otpExpire, 
    isVerified: false 
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
        isRetailer: user.isRetailer,
        message: 'OTP sent to email' 
      });
    } catch (error) {
      await User.findByIdAndDelete(user._id);
      res.status(500);
      throw new Error('Email failed to send. User not created.');
    }
  }
});

// @desc    Verify OTP and generate JWT
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

    generateToken(res, user._id);

    // 🟢 Return both roles so the Frontend can redirect correctly
    res.json({ 
      _id: user._id, 
      name: user.name, 
      email: user.email, 
      isAdmin: user.isAdmin,
      isRetailer: user.isRetailer 
    });
  } else {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }
});

// @desc    Update user profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    // 🟢 Handle Retailer status toggle
    if (typeof req.body.isRetailer !== 'undefined') {
      user.isRetailer = !!req.body.isRetailer;
    }

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
      isRetailer: updatedUser.isRetailer 
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all users (ADMIN ONLY)
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  // 🟢 PRIVACY GUARD: Retailers should not see the user list
  if (!req.user.isAdmin) {
    res.status(403);
    throw new Error('Access denied. Only Admins can view the platform user list.');
  }

  const users = await User.find({});
  res.json(users);
});

// @desc    Delete user (ADMIN ONLY)
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

// @desc    Request password reset
export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('No user found with that email');
  }
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpire = Date.now() + 1000 * 60 * 15; 
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = resetTokenExpire;
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  await sendEmail({
    email: user.email,
    subject: 'Password Reset Request',
    message: `Reset your password using this link: ${resetUrl} (valid for 15 minutes)`
  });
  res.json({ message: 'Password reset link sent to your email.' });
});

// @desc    Reset password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const user = await User.findOne({
    resetPasswordToken: token,
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
  res.json({ message: 'Password has been reset successfully.' });
});

export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: 'Logged out successfully' });
});

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, isRetailer: user.isRetailer });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpire = new Date(Date.now() + 10 * 60 * 1000); 
  await User.updateOne({ _id: user._id }, { $set: { otp, otpExpire } });
  try {
    await sendEmail({ email: user.email, subject: 'FlitStore - New Verification Code', message: `Your new OTP is: ${otp}` });
    res.json({ message: 'New OTP sent to your email' });
  } catch (error) {
    res.status(500);
    throw new Error('Email failed to send');
  }
});