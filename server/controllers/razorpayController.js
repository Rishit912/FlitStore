import asyncHandler from 'express-async-handler';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

// 🟢 Initialize with keys from your .env
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay Order
// @route   POST /api/razorpay
// @access  Private
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body; 

  // 🟢 SAFETY CHECK: Ensure amount exists and is a valid number
  if (!amount || isNaN(amount)) {
    res.status(400);
    throw new Error('Valid amount is required to create a Razorpay order');
  }

  const options = {
    // 🟢 Convert amount to paise (e.g., ₹634,455.00 becomes 63445500 paise)
    amount: Math.round(Number(amount) * 100), 
    currency: "INR",
    receipt: `receipt_order_${Date.now()}`,
  };

  try {
    const order = await instance.orders.create(options);
    
    if (!order) {
      res.status(500);
      throw new Error('Failed to create Razorpay order');
    }

    // 🟢 Successfully returns the order object to the frontend
    res.json(order); 
  } catch (error) {
    // 🟢 CRITICAL: Logs the actual Razorpay error to your console for debugging
    console.error("Razorpay API Error:", error); 

    res.status(500);
    // Returns the specific error message (e.g., "Authentication failed")
    throw new Error(error.description || error.message || 'Razorpay Order Creation Failed');
  }
});