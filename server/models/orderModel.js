import mongoose from 'mongoose';

const orderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        orderItems: [
            {
                name: { type: String, required: true },
                qty: { type: Number, required: true },
                image: { type: String, required: true },
                price: { type: Number, required: true },
                originalPrice: { type: Number, required: true },
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: 'Product',
                },
            },
        ],
        shippingAddress: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
        },
        paymentMethod: {
            type: String,
            required: true,
        },

        // we will use this later when we integrate payment gateway
        paymentResult: {
            id: { type: String },
            status: { type: String },
            update_time: { type: String },
            email_address: { type: String },
        },

        itemsPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        taxPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        shippingPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        discount: {
            type: Number,
            required: true,
            default: 0,
        },
        aiDiscountTotal: {
            type: Number,
            required: true,
            default: 0.0,
        },
        aiDiscountItems: {
            type: Number,
            required: true,
            default: 0,
        },
        isPaid: {
            type: Boolean,
            required: true,
            default: false,
        },
        paidAt: {
            type: Date,
        },
        isDelivered: {
            type: Boolean,
            required: true,
            default: false,
        },
        deliveredAt: {
            type: Date,
        },
        isCancelled: {
            type: Boolean,
            required: true,
            default: false,
        },
        cancelledAt: {
            type: Date,
        },
        cancelReason: {
            type: String,
        },
        refundStatus: {
            type: String,
            required: true,
            default: 'none',
        },
        refundAt: {
            type: Date,
        },
        isReturned: {
            type: Boolean,
            required: true,
            default: false,
        },
        returnedAt: {
            type: Date,
        },
        returnReason: {
            type: String,
        },
        returnStatus: {
            type: String,
            required: true,
            default: 'none',
        },
        returnRefundAt: {
            type: Date,
        },
        trackingToken: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;