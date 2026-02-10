import asyncHandler from 'express-async-handler';
import Product from '../models/product.js'; // Ensure the .js extension is present

// @desc    Get product name suggestions
// @route   GET /api/products/suggestions
// @access  Public
export const getProductSuggestions = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword;
  if (!keyword) return res.json([]);

  const products = await Product.find({
    name: { $regex: keyword, $options: 'i' }
  }).select('name').limit(3); // Limit to 5 for a clean UI

  res.json(products);
});

// @desc    Get all products (with optional search)
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const products = await Product.find({ ...keyword });
  res.json(products);
});

// @desc    Get low stock products
// @route   GET /api/products/low-stock
// @access  Private/Admin
export const getLowStockProducts = asyncHandler(async (req, res) => {
  const threshold = Number(req.query.threshold || 5);
  const limit = Number(req.query.limit || 20);

  const products = await Product.find({ countInStock: { $lte: threshold } })
    .sort({ countInStock: 1 })
    .limit(limit);

  res.json(products);
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product (Sample)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'Sample name',
    price: 0,
    user: req.user._id,
    image: '/images/sample.jpg',
    brand: 'Sample brand',
    category: 'Sample category',
    countInStock: 0,
    numReviews: 0,
    description: 'Sample description',
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    product.brand = brand;
    product.category = category;
    product.countInStock = countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});


// @desc    Create new review
// @route   POST /api/products/:id/reviews
export const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const isApproved = Boolean(req.user.isAdmin);
    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
      isApproved,
      approvedAt: isApproved ? new Date() : undefined,
      approvedBy: isApproved ? req.user._id : undefined,
    };

    product.reviews.push(review); // Add review to the array
    const approvedReviews = product.reviews.filter((item) => item.isApproved);
    product.numReviews = approvedReviews.length;
    product.rating = approvedReviews.length
      ? approvedReviews.reduce((acc, item) => acc + item.rating, 0) / approvedReviews.length
      : 0;

    await product.save();
    res.status(201).json({ message: isApproved ? 'Review added' : 'Review submitted for approval' });
  }
});

// @desc    Get pending reviews (Admin)
// @route   GET /api/products/reviews/pending
// @access  Private/Admin
export const getPendingReviews = asyncHandler(async (req, res) => {
  const products = await Product.find({ 'reviews.isApproved': false })
    .select('name reviews')
    .lean();

  const pending = products.flatMap((product) =>
    product.reviews
      .filter((review) => review.isApproved === false)
      .map((review) => ({
        productId: product._id,
        productName: product.name,
        reviewId: review._id,
        name: review.name,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      }))
  );

  res.json(pending);
});

// @desc    Approve a review (Admin)
// @route   PUT /api/products/:id/reviews/:reviewId/approve
// @access  Private/Admin
export const approveReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const review = product.reviews.id(req.params.reviewId);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  review.isApproved = true;
  review.approvedAt = new Date();
  review.approvedBy = req.user._id;

  const approvedReviews = product.reviews.filter((item) => item.isApproved);
  product.numReviews = approvedReviews.length;
  product.rating = approvedReviews.length
    ? approvedReviews.reduce((acc, item) => acc + item.rating, 0) / approvedReviews.length
    : 0;

  await product.save();
  res.json({ message: 'Review approved' });
});

// @desc    Reply to a review (Admin)
// @route   PUT /api/products/:id/reviews/:reviewId/reply
// @access  Private/Admin
export const replyReview = asyncHandler(async (req, res) => {
  const { reply } = req.body;
  if (!reply || !reply.trim()) {
    res.status(400);
    throw new Error('Reply is required');
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const review = product.reviews.id(req.params.reviewId);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  review.adminReply = reply.trim();
  review.repliedAt = new Date();

  await product.save();
  res.json({ message: 'Reply saved' });
});

// @desc    Reject a review (Admin)
// @route   DELETE /api/products/:id/reviews/:reviewId/reject
// @access  Private/Admin
export const rejectReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const review = product.reviews.id(req.params.reviewId);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  review.deleteOne();

  const approvedReviews = product.reviews.filter((item) => item.isApproved);
  product.numReviews = approvedReviews.length;
  product.rating = approvedReviews.length
    ? approvedReviews.reduce((acc, item) => acc + item.rating, 0) / approvedReviews.length
    : 0;

  await product.save();
  res.json({ message: 'Review rejected' });
});