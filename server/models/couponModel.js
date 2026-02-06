import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  name: { type: String, required: true, uppercase: true, unique: true },
  discount: { type: Number, required: true }, // Percentage (e.g., 10 for 10%)
  expiry: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;