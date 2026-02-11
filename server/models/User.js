import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, required: true, default: false },
  isVerified: { type: Boolean, required: true, default: false },
  otp: { type: String },
  otpExpire: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
    ],
    notifications: [
        {
            message: { type: String, required: true },
            type: { type: String, required: true, default: 'info' },
            isRead: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now },
        },
    ],
    addresses: [
        {
            label: { type: String, default: 'Home' },
            address: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
            phone: { type: String },
            isDefault: { type: Boolean, default: false },
        },
    ],
}, { timestamps: true });

// Method to compare entered password with hashed password
// 1. Password checking method
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// 2. Pre-save middleware (Modern Async Version)
userSchema.pre('save', async function() {
    // Check if the password was actually changed
    // This is vital so OTP updates don't re-hash the password
    if (!this.isModified('password')) {
        return; // Just return; Mongoose handles the "next" automatically here
    }

    // Only hash if it's a new user or password change
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model('User', userSchema);