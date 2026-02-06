import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Product from '../models/product.js';
import sendEmail from '../utils/sendEmail.js'; // 🟢 Import the utility

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
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    const order = new Order({
      orderItems: orderItems.map((x) => ({
        ...x,
        product: x.product || x._id,
        price: Number(x.price), 
        _id: undefined,
      })),
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      discount: discount || 0, 
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
    res.json(order);
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
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
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