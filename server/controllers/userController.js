import asyncHandler from '../middleware/asyncHandler.js';
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
