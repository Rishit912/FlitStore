import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Product from '../models/Product.js';
import sendEmail from '../utils/sendEmail.js';

const FULFILLMENT_STATUS = ['pending', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

// @desc    Create new order with PROFIT GUARD
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
    const verifiedOrderItems = [];

    // 🟢 PROFIT GUARD: Verify every item's price against the DB
    for (const item of orderItems) {
      const dbProduct = await Product.findById(item.product || item._id);
      if (!dbProduct) {
        res.status(404);
        throw new Error(`Product not found: ${item.name}`);
      }

      const requestedQty = Number(item.qty || 0);
      if (requestedQty <= 0) {
        res.status(400);
        throw new Error(`Invalid quantity for ${item.name}`);
      }
      if (Number(dbProduct.countInStock || 0) < requestedQty) {
        res.status(400);
        throw new Error(`${item.name} is out of stock or does not have enough quantity`);
      }

      // Security Check: AI Bargain limit is 10%
      const minAllowedPrice = dbProduct.price * 0.90; 
      if (Number(item.price) < Math.floor(minAllowedPrice)) {
        res.status(401);
        throw new Error(`Security Alert: Price tampering detected for ${item.name}`);
      }

      const finalPrice = Number(item.price);
      const originalPrice = Number(item.originalPrice ?? dbProduct.price);
      verifiedOrderItems.push({
        name: item.name,
        qty: Number(item.qty),
        image: item.image,
        price: finalPrice,
        originalPrice,
        isHaggled: Boolean(item.isHaggled || finalPrice < originalPrice),
        size: item.size || dbProduct.size || '',
        product: item.product || item._id,
      });
    }

    const order = new Order({
      orderItems: verifiedOrderItems,
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
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid & DECREMENT STOCK
export const updateOrderToPaid = asyncHandler(async (req, res) => {
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

    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.countInStock -= item.qty;
        await product.save();
      }
    }

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #2563eb;">Order Confirmed!</h2>
        <p>Hi ${order.user.name}, your payment for Order #${order._id} was successful.</p>
        <p><strong>Total Paid: ₹${order.totalPrice}</strong></p>
      </div>
    `;

    try {
      await sendEmail({
        email: order.user.email,
        subject: `Order #${order._id} Confirmation - FlitStore`,
        message: `Thank you for your order!`,
        html: emailHtml,
      });
    } catch (error) {}

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to delivered
export const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.orderItems = order.orderItems.map((item) => ({
      ...item.toObject(),
      fulfillmentStatus: 'delivered',
      packedAt: item.packedAt || Date.now(),
      shippedAt: item.shippedAt || Date.now(),
      itemDeliveredAt: Date.now(),
    }));
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
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
});

// @desc    Get dashboard summary with NEGOTIATION DATA
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const orders = await Order.find({});
  const numOrders = orders.length;
  const numProducts = await Product.countDocuments();
  
  const totalSales = orders.reduce((acc, item) => acc + item.totalPrice, 0);
  const paidOrders = orders.filter(order => order.isPaid).length;
  const couponUses = orders.filter(order => order.discount > 0).length;

  // 🟢 CALCULATE NEGOTIATION DATA
  // Measures difference between original Subtotal and Final Paid price
  const totalNegotiationLoss = orders.reduce((acc, order) => {
    const netPaid = order.totalPrice - (order.taxPrice + order.shippingPrice);
    const loss = order.itemsPrice - netPaid;
    return acc + (loss > 0 ? loss : 0);
  }, 0);

  res.json({
    numOrders,
    numProducts,
    paidOrders,
    couponUses,
    totalSales: totalSales.toFixed(2),
    negotiationLoss: totalNegotiationLoss.toFixed(2), // 🟢 Essential for Chart
    totalProfit: (totalSales * 0.20).toFixed(2),
  });
});

// @desc    Get logged in user orders
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }); 
  res.json(orders);
});

// @desc    Get orders for retailer's products
export const getRetailerOrders = asyncHandler(async (req, res) => {
  try {
    // Get all products owned by this retailer
    const retailerProducts = await Product.find({ user: req.user._id }).select('_id');
    const productIds = retailerProducts.map(p => p._id);

    if (productIds.length === 0) {
      return res.json([]);
    }

    // Find orders that contain any of retailer's products
    const orders = await Order.find({
      'orderItems.product': { $in: productIds }
    }).populate('user', 'name email').sort({ createdAt: -1 });

    // Filter orderItems to only show retailer's products
    const filteredOrders = orders.map((order) => {
      const retailerItems = order.orderItems.filter((item) =>
        productIds.some((pid) => String(pid) === String(item.product))
      );
      const retailerAmount = retailerItems.reduce((acc, item) => acc + Number(item.price) * Number(item.qty), 0);
      return {
        ...order.toObject(),
        orderItems: retailerItems,
        retailerAmount: Number(retailerAmount.toFixed(2)),
      };
    });

    res.json(filteredOrders);
  } catch (error) {
    res.status(500);
    throw new Error('Error fetching retailer orders');
  }
});

// @desc    Get reviews for retailer's products
export const getRetailerReviews = asyncHandler(async (req, res) => {
  try {
    // Get all products owned by this retailer
    const retailerProducts = await Product.find({ user: req.user._id });

    // Extract all reviews from retailer's products
    const allReviews = [];
    retailerProducts.forEach(product => {
      if (product.reviews && product.reviews.length > 0) {
        product.reviews.forEach(review => {
          allReviews.push({
            _id: review._id,
            productId: product._id,
            productName: product.name,
            rating: review.rating,
            name: review.name,
            comment: review.comment,
            createdAt: review.createdAt || product.updatedAt || product.createdAt,
          });
        });
      }
    });

    res.json(allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    res.status(500);
    throw new Error('Error fetching retailer reviews');
  }
});

// @desc    Get analytics for retailer's products
export const getRetailerAnalytics = asyncHandler(async (req, res) => {
  try {
    // Get all products owned by this retailer
    const retailerProducts = await Product.find({ user: req.user._id }).select('_id price');
    const productIds = retailerProducts.map(p => p._id);

    if (productIds.length === 0) {
      return res.json({
        totalOrders: 0,
        totalRevenue: 0,
        totalUnitsSold: 0,
        averageOrderValue: 0,
        totalReviews: 0,
        averageRating: 0,
      });
    }

    // Find orders containing retailer's products
    const orders = await Order.find({
      'orderItems.product': { $in: productIds }
    });

    let totalRevenue = 0;
    let totalUnitsSold = 0;
    let totalReviews = 0;
    let totalRating = 0;
    let reviewCount = 0;

    // Calculate metrics
    orders.forEach(order => {
      const retailerItems = order.orderItems.filter(item => 
        productIds.some(pid => String(pid) === String(item.product))
      );
      
      retailerItems.forEach(item => {
        totalRevenue += item.price * item.qty;
        totalUnitsSold += item.qty;
      });
    });

    // Get reviews count and rating
    const products = await Product.find({ user: req.user._id }).select('rating numReviews reviews');
    products.forEach(product => {
      if (product.reviews) {
        totalReviews += product.reviews.length;
        if (product.rating) totalRating += product.rating * product.numReviews;
        if (product.numReviews) reviewCount += product.numReviews;
      }
    });

    const averageRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : 0;

    res.json({
      totalOrders: orders.length,
      totalRevenue: totalRevenue.toFixed(2),
      totalUnitsSold,
      averageOrderValue: orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : 0,
      totalReviews,
      averageRating,
    });
  } catch (error) {
    res.status(500);
    throw new Error('Error fetching retailer analytics');
  }
});

// @desc    Update order fulfillment status (retailer/admin)
// @route   PUT /api/orders/:id/fulfillment
// @access  Private
export const updateOrderFulfillment = asyncHandler(async (req, res) => {
  const { status, trackingNumber = '', courierPartner = '' } = req.body;

  if (!FULFILLMENT_STATUS.includes(status)) {
    res.status(400);
    throw new Error('Invalid fulfillment status');
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  let targetProductIdSet = null;
  if (!req.user.isAdmin) {
    const retailerProducts = await Product.find({ user: req.user._id }).select('_id');
    targetProductIdSet = new Set(retailerProducts.map((p) => String(p._id)));
  }

  let updatedCount = 0;
  order.orderItems = order.orderItems.map((item) => {
    const itemObj = item.toObject();
    const isAllowedForRetailer = !targetProductIdSet || targetProductIdSet.has(String(item.product));
    if (!isAllowedForRetailer) return itemObj;

    updatedCount += 1;
    itemObj.fulfillmentStatus = status;
    if (courierPartner) itemObj.courierPartner = courierPartner;
    if (trackingNumber) itemObj.trackingNumber = trackingNumber;

    if (status === 'packed' && !itemObj.packedAt) {
      itemObj.packedAt = Date.now();
    }
    if (status === 'shipped' || status === 'out_for_delivery') {
      if (!itemObj.packedAt) itemObj.packedAt = Date.now();
      if (!itemObj.shippedAt) itemObj.shippedAt = Date.now();
    }
    if (status === 'delivered') {
      if (!itemObj.packedAt) itemObj.packedAt = Date.now();
      if (!itemObj.shippedAt) itemObj.shippedAt = Date.now();
      itemObj.itemDeliveredAt = Date.now();
    }
    return itemObj;
  });

  if (updatedCount === 0) {
    res.status(403);
    throw new Error('Not allowed to update fulfillment for this order');
  }

  const everyItemDelivered = order.orderItems.length > 0 && order.orderItems.every((item) => item.fulfillmentStatus === 'delivered');
  order.isDelivered = everyItemDelivered;
  order.deliveredAt = everyItemDelivered ? Date.now() : undefined;

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});