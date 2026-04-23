import asyncHandler from 'express-async-handler';
import Product from '../models/product.js'; // Ensure the .js extension is present
import Order from '../models/orderModel.js';

const normalizeProductField = (value) => String(value ?? '').trim().toLowerCase();

const isDuplicateRetailerProduct = (existingProduct, nextProduct) => {
  return (
    normalizeProductField(existingProduct.name) === normalizeProductField(nextProduct.name) &&
    normalizeProductField(existingProduct.brand) === normalizeProductField(nextProduct.brand) &&
    normalizeProductField(existingProduct.category) === normalizeProductField(nextProduct.category) &&
    normalizeProductField(existingProduct.size) === normalizeProductField(nextProduct.size) &&
    Number(existingProduct.price) === Number(nextProduct.price) &&
    normalizeProductField(existingProduct.description) === normalizeProductField(nextProduct.description) &&
    Number(existingProduct.countInStock) === Number(nextProduct.countInStock)
  );
};

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
  const categoryFilter = req.query.category
    ? {
        category: {
          $regex: `^${req.query.category}$`,
          $options: 'i',
        },
      }
    : {};

  const brandFilter = req.query.brand
    ? {
        brand: {
          $regex: `^${req.query.brand}$`,
          $options: 'i',
        },
      }
    : {};

  const minPrice = Number(req.query.minPrice || 0);
  const maxPrice = Number(req.query.maxPrice || 0);
  const priceFilter =
    minPrice || maxPrice
      ? {
          price: {
            ...(minPrice ? { $gte: minPrice } : {}),
            ...(maxPrice ? { $lte: maxPrice } : {}),
          },
        }
      : {};

  const minRating = Number(req.query.minRating || 0);
  const ratingFilter = minRating ? { rating: { $gte: minRating } } : {};

  const keyword = req.query.keyword
    ? {
        $or: [
          {
            name: {
              $regex: req.query.keyword,
              $options: 'i',
            },
          },
          {
            category: {
              $regex: req.query.keyword,
              $options: 'i',
            },
          },
        ],
      }
    : {};

  const sortMap = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating_desc: { rating: -1 },
    newest: { createdAt: -1 },
  };
  const sortKey = req.query.sort || 'newest';
  const sort = sortMap[sortKey] || sortMap.newest;

  const products = await Product.find({
    ...keyword,
    ...categoryFilter,
    ...brandFilter,
    ...priceFilter,
    ...ratingFilter,
  }).sort(sort);
  res.json(products);
});

// @desc    Get distinct product categories
// @route   GET /api/products/categories
// @access  Public
export const getProductCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  const cleaned = categories
    .filter((c) => typeof c === 'string' && c.trim().length > 0)
    .map((c) => c.trim())
    .sort((a, b) => a.localeCompare(b));
  res.json(cleaned);
});

// @desc    Get distinct product brands
// @route   GET /api/products/brands
// @access  Public
export const getProductBrands = asyncHandler(async (req, res) => {
  const brands = await Product.distinct('brand');
  const cleaned = brands
    .filter((b) => typeof b === 'string' && b.trim().length > 0)
    .map((b) => b.trim())
    .sort((a, b) => a.localeCompare(b));
  res.json(cleaned);
});

// @desc    Get best seller products by actual sales
// @route   GET /api/products/best-sellers
// @access  Public
export const getBestSellerProducts = asyncHandler(async (req, res) => {
  const topLimit = Number(req.query.limit || 8);

  const paidOrders = await Order.find({ isPaid: true }).populate('orderItems.product', 'name image brand category price rating numReviews createdAt');
  const salesMap = new Map();

  for (const order of paidOrders) {
    for (const item of order.orderItems) {
      const product = item.product;
      if (!product || !product._id) continue;

      const productId = product._id.toString();
      const current = salesMap.get(productId) || {
        _id: productId,
        product,
        unitsSold: 0,
        revenue: 0,
        reviewScore: Number(product.rating || 0),
        reviewCount: Number(product.numReviews || 0),
      };

      current.unitsSold += Number(item.qty || 0);
      current.revenue += Number(item.qty || 0) * Number(item.price || product.price || 0);
      salesMap.set(productId, current);
    }
  }

  const bestSellers = Array.from(salesMap.values())
    .sort((a, b) => {
      const unitsDiff = b.unitsSold - a.unitsSold;
      if (unitsDiff !== 0) return unitsDiff;
      const ratingDiff = Number(b.reviewScore || 0) - Number(a.reviewScore || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return Number(b.reviewCount || 0) - Number(a.reviewCount || 0);
    })
    .slice(0, topLimit)
    .map((item) => ({
      ...item.product.toObject(),
      unitsSold: item.unitsSold,
      revenue: Number(item.revenue.toFixed(2)),
    }));

  res.json(bestSellers);
});

// @desc    Get retailer dashboard summary
// @route   GET /api/products/retailer/summary
// @access  Private
export const getRetailerSummary = asyncHandler(async (req, res) => {
  const products = await Product.find({ user: req.user._id });
  const productIds = products.map((product) => product._id.toString());
  const orders = await Order.find({ isPaid: true }).populate('orderItems.product', 'user');

  let totalRevenue = 0;
  let totalUnitsSold = 0;

  for (const order of orders) {
    for (const item of order.orderItems) {
      const product = item.product;
      if (!product || !product.user) continue;
      if (product.user.toString() !== req.user._id.toString()) continue;
      totalUnitsSold += Number(item.qty || 0);
      totalRevenue += Number(item.qty || 0) * Number(item.price || 0);
    }
  }

  res.json({
    totalProducts: products.length,
    totalUnitsSold,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalOrders: orders.filter((order) =>
      order.orderItems.some((item) => item.product && item.product.user && item.product.user.toString() === req.user._id.toString())
    ).length,
  });
});

// @desc    Get products owned by the logged-in retailer
// @route   GET /api/products/my-products
// @access  Private
export const getMyProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(products);
});

// @desc    Create product for the logged-in retailer
// @route   POST /api/products/my-products
// @access  Private
export const createMyProduct = asyncHandler(async (req, res) => {
  if (!req.user.isRetailer && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Only retailers can create products');
  }

  const normalizedNextProduct = {
    name: req.body.name,
    brand: req.body.brand,
    category: req.body.category,
    size: req.body.size || '',
    price: Number(req.body.price || 0),
    description: req.body.description,
    countInStock: Number(req.body.countInStock || 0),
  };

  const duplicateProduct = await Product.findOne({ user: req.user._id });
  if (duplicateProduct) {
    const existingMatches = await Product.find({ user: req.user._id });
    const exactDuplicate = existingMatches.find((product) => isDuplicateRetailerProduct(product, normalizedNextProduct));

    if (exactDuplicate) {
      res.status(400);
      throw new Error('This product already exists in your catalog');
    }
  }

  const product = new Product({
    name: req.body.name || 'Untitled product',
    price: normalizedNextProduct.price,
    user: req.user._id,
    image: req.body.image || '/default-product.png',
    brand: req.body.brand || 'General',
    category: req.body.category || 'Uncategorized',
    size: req.body.size || '',
    countInStock: normalizedNextProduct.countInStock,
    numReviews: 0,
    description: req.body.description || '',
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update product owned by the logged-in retailer
// @route   PUT /api/products/my-products/:id
// @access  Private
export const updateMyProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error('You can only edit your own products');
  }

  const nextProduct = {
    name: req.body.name ?? product.name,
    brand: req.body.brand ?? product.brand,
    category: req.body.category ?? product.category,
    size: req.body.size ?? product.size,
    price: req.body.price ?? product.price,
    description: req.body.description ?? product.description,
    countInStock: req.body.countInStock ?? product.countInStock,
  };

  const existingProducts = await Product.find({ user: req.user._id, _id: { $ne: product._id } });
  const duplicateProduct = existingProducts.find((item) => isDuplicateRetailerProduct(item, nextProduct));

  if (duplicateProduct) {
    res.status(400);
    throw new Error('This product already exists in your catalog');
  }

  product.name = nextProduct.name;
  product.price = nextProduct.price;
  product.description = nextProduct.description;
  product.image = req.body.image ?? product.image;
  product.brand = nextProduct.brand;
  product.category = nextProduct.category;
  product.size = nextProduct.size;
  product.countInStock = nextProduct.countInStock;

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

// @desc    Delete product owned by the logged-in retailer
// @route   DELETE /api/products/my-products/:id
// @access  Private
export const deleteMyProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error('You can only delete your own products');
  }

  // 🟢 CASCADE: Remove product from any pending orders
  // Note: This maintains order history but marks the product as deleted
  await Order.updateMany(
    { 'orderItems.product': product._id, isPaid: false },
    { $pull: { orderItems: { product: product._id } } }
  );

  // 🟢 Delete the product
  await Product.deleteOne({ _id: product._id });
  
  res.json({ message: 'Product removed successfully and removed from pending orders' });
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
    size: '',
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
  const { name, price, description, image, brand, category, size, countInStock } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    product.brand = brand;
    product.category = category;
    product.size = size ?? product.size;
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

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const alreadyReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You already reviewed this product');
  }

  const review = {
    name: req.user.name,
    rating: Number(rating),
    comment,
    user: req.user._id,
  };

  product.reviews.push(review); // Add review to the array
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

  await product.save();
  res.status(201).json({ message: 'Review added' });
});

// @desc    Delete a product review (retailer/admin)
// @route   DELETE /api/products/:id/reviews/:reviewId
export const deleteProductReview = asyncHandler(async (req, res) => {
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

  const isProductOwner = product.user.toString() === req.user._id.toString();
  if (!isProductOwner && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  product.reviews = product.reviews.filter(
    (item) => item._id.toString() !== req.params.reviewId
  );

  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.length > 0
      ? product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length
      : 0;

  await product.save();
  res.json({ message: 'Review deleted' });
});