import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Product from '../models/product.js'; 

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
    discount, // 🟢 Capture discount from frontend
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    const order = new Order({
      orderItems: orderItems.map((x) => ({
        ...x,
        product: x.product || x._id,
        price: Number(x.price), // Secure bargaining logic
        _id: undefined,
      })),
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      discount: discount || 0, // 🟢 Save discount to database
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

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

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
  
  // Total Sales Calculation
  const totalSales = orders.reduce((acc, item) => acc + item.totalPrice, 0);
  
  // 🟢 NEW STATS FOR ADMIN SUMMARY
  const paidOrders = orders.filter(order => order.isPaid).length;
  const couponUses = orders.filter(order => order.discount > 0).length; // Tracks coupon impact
  
  // 20% profit margin for your FlitStore demonstration
  const totalProfit = totalSales * 0.20;

  res.json({
    numOrders,
    numProducts,
    paidOrders, // 🟢 Needed for AdminSummary
    couponUses, // 🟢 Needed for AdminSummary
    totalSales: totalSales.toFixed(2),
    totalProfit: totalProfit.toFixed(2),
  });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }); 
  res.json(orders);
});