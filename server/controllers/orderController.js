import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import Order from '../models/orderModel.js';
import Product from '../models/product.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js'; // 🟢 Import the utility

const pushNotification = async (userId, message, type = 'info') => {
  try {
    await User.updateOne(
      { _id: userId },
      { $push: { notifications: { message, type } } }
    );
  } catch (error) {
    console.error('Failed to save notification:', error);
  }
};

const ensureTrackingToken = async (order) => {
  if (!order.trackingToken) {
    order.trackingToken = crypto.randomBytes(20).toString('hex');
    await order.save();
  }
  return order;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    discount, 
    aiDiscountTotal,
    aiDiscountItems,
  } = req.body;

  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
    res.status(400);
    throw new Error('Invalid shipping address');
  }

  if (!paymentMethod) {
    res.status(400);
    throw new Error('Payment method is required');
  }

  const hasInvalidItem = !Array.isArray(orderItems) || orderItems.some((item) => {
    const price = Number(item?.price);
    const qty = Number(item?.qty);
    return !item || !item.name || !item.image || !item.product || Number.isNaN(price) || Number.isNaN(qty) || qty <= 0;
  });

  if (hasInvalidItem) {
    res.status(400);
    throw new Error('Invalid order item data');
  }

  const parsedItemsPrice = Number(itemsPrice);
  const parsedTaxPrice = Number(taxPrice);
  const parsedShippingPrice = Number(shippingPrice);
  const parsedTotalPrice = Number(totalPrice);

  if ([parsedItemsPrice, parsedTaxPrice, parsedShippingPrice, parsedTotalPrice].some((value) => Number.isNaN(value))) {
    res.status(400);
    throw new Error('Invalid pricing values');
  }

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    const order = new Order({
      orderItems: orderItems.map((x) => ({
        ...x,
        product: x.product || x._id,
        price: Number(x.price), 
        originalPrice: Number(x.originalPrice || x.price),
        _id: undefined,
      })),
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice: parsedItemsPrice,
      taxPrice: parsedTaxPrice,
      shippingPrice: parsedShippingPrice,
      totalPrice: parsedTotalPrice,
      discount: discount || 0, 
      aiDiscountTotal: aiDiscountTotal || 0,
      aiDiscountItems: aiDiscountItems || 0,
      trackingToken: crypto.randomBytes(20).toString('hex'),
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (order) {
    const orderData = order.toObject();
    if (!req.user.isAdmin) {
      delete orderData.trackingToken;
    }
    res.json(orderData);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid & DECREMENT STOCK & SEND EMAIL
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = asyncHandler(async (req, res) => {
  // 🟢 Populate user to get the email address for the receipt
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    await ensureTrackingToken(order);
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer ? req.body.payer.email_address : '',
    };

    const updatedOrder = await order.save();

    // 🟢 Step 1: Update Inventory Stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.countInStock -= item.qty;
        await product.save();
      }
    }

    // 🟢 Step 2: Send Confirmation Email
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #2563eb;">Order Confirmed!</h2>
        <p>Hi ${order.user.name},</p>
        <p>Thank you for shopping at <strong>FlitStore</strong>. Your payment was successful and your order is being processed.</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p><strong>Order ID:</strong> ${order._id}</p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="text-align: left; padding: 8px;">Item</th>
              <th style="text-align: center; padding: 8px;">Qty</th>
              <th style="text-align: right; padding: 8px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${order.orderItems.map(item => `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.qty}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p style="text-align: right; font-size: 18px;"><strong>Total Paid: ₹${order.totalPrice}</strong></p>
        <p style="font-size: 12px; color: #666; margin-top: 30px;">This is an automated receipt from FlitCode IT Services.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: order.user.email,
        subject: `Order #${order._id} Confirmation - FlitStore`,
        message: `Thank you for your order of ₹${order.totalPrice}. Order ID: ${order._id}`, // Fallback text
        html: emailHtml,
      });
    } catch (error) {
      console.error("Email sending failed:", error);
      // We don't throw an error here so the user still sees their "Success" screen even if the email fails
    }

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    await ensureTrackingToken(order);
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Cancel order (user/admin)
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  await ensureTrackingToken(order);

  if (String(order.user) !== String(req.user._id) && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized to cancel this order');
  }

  if (order.isDelivered) {
    res.status(400);
    throw new Error('Delivered orders cannot be cancelled');
  }

  if (order.isCancelled) {
    res.status(400);
    throw new Error('Order already cancelled');
  }

  if (!order.isPaid) {
    res.status(400);
    throw new Error('Order can only be cancelled after payment is completed');
  }

  const twoHoursMs = 2 * 60 * 60 * 1000;
  const createdAtMs = new Date(order.createdAt).getTime();
  if (Number.isNaN(createdAtMs) || Date.now() - createdAtMs > twoHoursMs) {
    res.status(400);
    throw new Error('Order can only be cancelled within 2 hours of placing it');
  }

  order.isCancelled = true;
  order.cancelledAt = Date.now();
  order.cancelReason = req.body?.reason || 'Cancelled by user';
  order.refundStatus = order.isPaid ? 'pending' : 'none';

  // Restock items when cancelling
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.countInStock += item.qty;
      await product.save();
    }
  }

  const updatedOrder = await order.save();

  const user = await User.findById(order.user).select('name email');
  if (user) {
    const refundNote = order.isPaid ? 'Refund will be processed shortly.' : 'No payment was captured.';
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #dc2626;">Order Cancelled</h2>
        <p>Hi ${user.name},</p>
        <p>Your order <strong>#${order._id}</strong> has been cancelled.</p>
        <p>${refundNote}</p>
        <p style="font-size: 12px; color: #666;">Reason: ${order.cancelReason}</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: `Order #${order._id} Cancelled - FlitStore`,
        message: `Your order ${order._id} has been cancelled. ${refundNote}`,
        html: emailHtml,
      });
    } catch (error) {
      console.error('Cancel email failed:', error);
    }

    await pushNotification(
      user._id,
      `Order #${order._id} cancelled. ${refundNote}`,
      'warning'
    );
  }

  res.json(updatedOrder);
});

// @desc    Mark refund as processed (Admin)
// @route   PUT /api/orders/:id/refund
// @access  Private/Admin
export const updateOrderRefund = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  await ensureTrackingToken(order);

  if (!order.isCancelled || order.refundStatus !== 'pending') {
    res.status(400);
    throw new Error('Refund is not pending for this order');
  }

  order.refundStatus = 'processed';
  order.refundAt = Date.now();

  const updatedOrder = await order.save();

  const user = await User.findById(order.user).select('name email');
  if (user) {
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #16a34a;">Refund Processed</h2>
        <p>Hi ${user.name},</p>
        <p>Your refund for order <strong>#${order._id}</strong> has been processed.</p>
        <p>Please allow 3-5 business days for the amount to reflect in your account.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: `Refund Processed for Order #${order._id} - FlitStore`,
        message: `Refund processed for order ${order._id}.`,
        html: emailHtml,
      });
    } catch (error) {
      console.error('Refund email failed:', error);
    }

    await pushNotification(
      user._id,
      `Refund processed for order #${order._id}.`,
      'success'
    );
  }

  res.json(updatedOrder);
});

// @desc    Request order return (user)
// @route   PUT /api/orders/:id/return
// @access  Private
export const requestOrderReturn = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  await ensureTrackingToken(order);

  if (String(order.user) !== String(req.user._id) && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized to return this order');
  }

  if (order.isCancelled) {
    res.status(400);
    throw new Error('Cancelled orders cannot be returned');
  }

  if (!order.isDelivered || !order.deliveredAt) {
    res.status(400);
    throw new Error('Only delivered orders can be returned');
  }

  if (order.isReturned) {
    res.status(400);
    throw new Error('Return already requested');
  }

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const deliveredAtMs = new Date(order.deliveredAt).getTime();
  if (Number.isNaN(deliveredAtMs) || Date.now() - deliveredAtMs > sevenDaysMs) {
    res.status(400);
    throw new Error('Order can only be returned within 7 days of delivery');
  }

  order.isReturned = true;
  order.returnedAt = Date.now();
  order.returnReason = req.body?.reason || 'Return requested by user';
  order.returnStatus = 'pending';

  const updatedOrder = await order.save();

  const user = await User.findById(order.user).select('name email');
  if (user) {
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #d97706;">Return Requested</h2>
        <p>Hi ${user.name},</p>
        <p>We have received your return request for order <strong>#${order._id}</strong>.</p>
        <p>Our team will review it and update you shortly.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: `Return Requested for Order #${order._id} - FlitStore`,
        message: `Return requested for order ${order._id}.`,
        html: emailHtml,
      });
    } catch (error) {
      console.error('Return request email failed:', error);
    }

    await pushNotification(
      user._id,
      `Return requested for order #${order._id}.`,
      'info'
    );
  }

  res.json(updatedOrder);
});

// @desc    Mark return refund as processed (Admin)
// @route   PUT /api/orders/:id/return/refund
// @access  Private/Admin
export const updateReturnRefund = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  await ensureTrackingToken(order);

  if (!order.isReturned || order.returnStatus !== 'pending') {
    res.status(400);
    throw new Error('Return is not pending for this order');
  }

  order.returnStatus = 'refunded';
  order.returnRefundAt = Date.now();

  const updatedOrder = await order.save();

  const user = await User.findById(order.user).select('name email');
  if (user) {
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #16a34a;">Return Refund Processed</h2>
        <p>Hi ${user.name},</p>
        <p>Your refund for return on order <strong>#${order._id}</strong> has been processed.</p>
        <p>Please allow 3-5 business days for the amount to reflect in your account.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: `Return Refund Processed for Order #${order._id} - FlitStore`,
        message: `Return refund processed for order ${order._id}.`,
        html: emailHtml,
      });
    } catch (error) {
      console.error('Return refund email failed:', error);
    }

    await pushNotification(
      user._id,
      `Return refund processed for order #${order._id}.`,
      'success'
    );
  }

  res.json(updatedOrder);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');

  for (const order of orders) {
    await ensureTrackingToken(order);
  }

  res.json(orders);
});

// @desc    Regenerate tracking token (Admin)
// @route   PUT /api/orders/:id/tracking-token
// @access  Private/Admin
export const regenerateTrackingToken = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.trackingToken = crypto.randomBytes(20).toString('hex');
  await order.save();
  res.json({ trackingToken: order.trackingToken });
});

// @desc    Public tracking status
// @route   GET /api/orders/track/:token
// @access  Public
export const getTrackingStatus = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ trackingToken: req.params.token });
  if (!order) {
    res.status(404);
    throw new Error('Tracking link is invalid');
  }

  res.json({
    orderId: order._id,
    trackingId: order._id.toString().substring(0, 8).toUpperCase(),
    createdAt: order.createdAt,
    isPaid: order.isPaid,
    paidAt: order.paidAt,
    isDelivered: order.isDelivered,
    deliveredAt: order.deliveredAt,
    isCancelled: order.isCancelled,
    cancelledAt: order.cancelledAt,
    isReturned: order.isReturned,
    returnedAt: order.returnedAt,
    refundStatus: order.refundStatus,
    returnStatus: order.returnStatus,
  });
});

// @desc    Get dashboard summary data for AdminSummary component
// @route   GET /api/orders/summary
// @access  Private/Admin
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const orders = await Order.find({});
  const numOrders = orders.length;
  const numProducts = await Product.countDocuments();
  const totalSales = orders.reduce((acc, item) => acc + item.totalPrice, 0);
  const paidOrders = orders.filter(order => order.isPaid).length;
  const couponUses = orders.filter(order => order.discount > 0).length;
  const totalProfit = totalSales * 0.20;

  res.json({
    numOrders,
    numProducts,
    paidOrders,
    couponUses,
    totalSales: totalSales.toFixed(2),
    totalProfit: totalProfit.toFixed(2),
  });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }); 
  res.json(orders);
});

// @desc    Get AI discount analytics
// @route   GET /api/orders/ai-discounts
// @access  Private/Admin
export const getAiDiscountSummary = asyncHandler(async (req, res) => {
  const orders = await Order.find({});
  const aiOrders = orders.filter((order) => (order.aiDiscountTotal || 0) > 0);
  const totalDiscount = aiOrders.reduce((sum, order) => sum + (order.aiDiscountTotal || 0), 0);
  const avgDiscount = aiOrders.length ? totalDiscount / aiOrders.length : 0;

  const productTotals = {};
  aiOrders.forEach((order) => {
    order.orderItems.forEach((item) => {
      const original = Number(item.originalPrice || item.price);
      const diff = original - Number(item.price);
      if (diff > 0) {
        const key = item.name;
        productTotals[key] = (productTotals[key] || 0) + diff * Number(item.qty || 1);
      }
    });
  });

  const topProducts = Object.entries(productTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, amount]) => ({ name, amount }));

  const revenueBefore = orders.reduce((sum, order) => {
    return sum + Number(order.totalPrice || 0) + Number(order.aiDiscountTotal || 0);
  }, 0);
  const revenueAfter = orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);

  res.json({
    totalDiscount,
    avgDiscount,
    aiOrdersCount: aiOrders.length,
    topProducts,
    revenueBefore,
    revenueAfter,
  });
});