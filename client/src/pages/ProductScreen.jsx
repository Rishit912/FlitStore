import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { FaArrowLeft, FaTrash } from 'react-icons/fa';
import { addToCart } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import Rating from '../components/Rating';

const APPAREL_CATEGORY_KEYWORDS = [
    'cloth',
    'clothing',
    'apparel',
    'garment',
    'shirt',
    't-shirt',
    'tshirt',
    'pant',
    'jean',
    'dress',
    'kurti',
    'saree',
    'skirt',
    'top',
    'jacket',
    'hoodie',
    'trouser',
    'shorts',
    'wear',
];

const isApparelCategory = (value) => {
    const normalized = String(value || '').toLowerCase();
    return APPAREL_CATEGORY_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

const ProductScreen = () => {
    const [product, setProduct] = useState({ reviews: [] });
    const [qty, setQty] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loadingReview, setLoadingReview] = useState(false);
    const [deletingReviewId, setDeletingReviewId] = useState(null);

    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { userInfo } = useSelector((state) => state.auth);

    const fetchProduct = useCallback(async () => {
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
    }, [id]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    useEffect(() => {
        setSelectedSize('');
        setQty(1);
    }, [product.size, product._id]);

    const availableSize = String(product.size || '').trim();
    const requiresSizeSelection = Boolean(availableSize) && isApparelCategory(product.category);

    const addToCartHandler = () => {
        if (product.countInStock === 0) {
            toast.error('Item is out of stock');
            return;
        }

        if (requiresSizeSelection && selectedSize !== availableSize) {
            toast.error('Please select the available size before adding this item to cart.');
            return;
        }

        dispatch(addToCart({
            ...product,
            price: Number(product.price),
            originalPrice: Number(product.price),
            size: availableSize,
            qty,
        }));
        navigate('/cart');
    };

    const submitReviewHandler = async (e) => {
        e.preventDefault();
        if (!userInfo) {
            toast.error('Please login to submit a review');
            return;
        }
        if (!rating || !comment.trim()) {
            toast.error('Please provide both rating and comment');
            return;
        }
        try {
            setLoadingReview(true);
            await axios.post(`/api/products/${id}/reviews`, { rating: Number(rating), comment }, {
                headers: { 'Content-Type': 'application/json' }
            });
            toast.success('Thank you! Your review has been added.');
            setRating(0);
            setComment('');
            fetchProduct(); // Refresh product to show new review
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoadingReview(false);
        }
    };

    const deleteReviewHandler = async (reviewId) => {
        if (!window.confirm('Delete this review?')) {
            return;
        }

        try {
            setDeletingReviewId(reviewId);
            await axios.delete(`/api/products/${id}/reviews/${reviewId}`);
            toast.success('Review deleted successfully');
            fetchProduct();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete review');
        } finally {
            setDeletingReviewId(null);
        }
    };

    const canManageReviews = Boolean(
        userInfo && (userInfo.isAdmin || (product.user && String(product.user) === String(userInfo._id)))
    );

    const qtyUpperBound = Math.max(Number(product.countInStock || 1), 1);
    const qtyOptions = [...Array(qtyUpperBound).keys()].map((index) => index + 1);

    return (
        <>
                <div className="bg-app min-h-screen">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
                        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-foreground mb-6">
                            <FaArrowLeft /> Back to shopping
                        </Link>

                        <div className="grid grid-cols-1 gap-8 items-start">
                                    <div className="space-y-6">
                                        <div className="app-card overflow-hidden border border-app shadow-xl bg-surface">
                                            <div className="grid grid-cols-1 lg:grid-cols-[96px_minmax(0,1fr)] gap-4 p-4 lg:p-5">
                                                <div className="hidden lg:flex flex-col gap-3">
                                                    <div className="h-20 rounded-xl border border-app bg-surface-2 overflow-hidden">
                                                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = '/default-product.png'; }} />
                                                    </div>
                                                    <div className="h-20 rounded-xl border border-app bg-surface-2 overflow-hidden opacity-80">
                                                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = '/default-product.png'; }} />
                                                    </div>
                                                    <div className="h-20 rounded-xl border border-app bg-surface-2 overflow-hidden opacity-80">
                                                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = '/default-product.png'; }} />
                                                    </div>
                                                </div>

                                                <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-transparent border border-white/10 min-h-[520px] flex items-center justify-center p-2 lg:p-3">
                                                    <img
                                                        src={product.image && product.image.trim() !== '' ? `${product.image}?t=${new Date(product.updatedAt).getTime()}` : `https://source.unsplash.com/900x900/?${encodeURIComponent(product.name || 'product')},shopping`}
                                                        alt={product.name}
                                                        className="w-full h-full max-h-[620px] object-contain rounded-2xl bg-app"
                                                        onError={(e) => { e.target.onerror = null; e.target.src = '/default-product.png'; }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="app-card p-5">
                                                <p className="text-[11px] uppercase tracking-[0.25em] text-muted font-black">Brand</p>
                                                <p className="mt-2 text-lg font-black text-foreground">{product.brand || 'FlitStore Choice'}</p>
                                            </div>
                                            <div className="app-card p-5">
                                                <p className="text-[11px] uppercase tracking-[0.25em] text-muted font-black">Category</p>
                                                <p className="mt-2 text-lg font-black text-foreground">{product.category || 'Trending'}</p>
                                            </div>
                                            {product.size && (
                                                <div className="app-card p-5">
                                                    <p className="text-[11px] uppercase tracking-[0.25em] text-muted font-black">Size</p>
                                                    <p className="mt-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-black text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">{product.size}</p>
                                                </div>
                                            )}
                                            <div className="app-card p-5">
                                                <p className="text-[11px] uppercase tracking-[0.25em] text-muted font-black">Availability</p>
                                                <p className={`mt-2 text-lg font-black ${product.countInStock > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="app-card p-6 lg:p-8">
                                            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                                                <div>
                                                    <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight">{product.name}</h1>
                                                    <div className="mt-2">
                                                        <Rating value={product.rating} text={`${product.numReviews} reviews`} />
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-3xl font-black text-primary">₹{Number(product.price).toFixed(0)}</p>
                                                </div>
                                            </div>

                                            <p className="text-muted leading-7 mb-6">{product.description}</p>

                                            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
                                                <div className="rounded-2xl border border-app bg-surface-2 p-4">
                                                    <p className="text-[11px] uppercase tracking-[0.25em] text-muted font-black">Buy now</p>
                                                    <p className="mt-2 text-sm text-muted leading-6">
                                                        If this product has a size, you must pick it before adding it to the cart.
                                                    </p>
                                                    {requiresSizeSelection && (
                                                        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                                                            Available size: {availableSize}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="rounded-2xl border border-app bg-surface-2 p-4 space-y-4">
                                                    {requiresSizeSelection && (
                                                        <div>
                                                            <label className="block text-xs font-black uppercase tracking-widest text-muted mb-2">Select Size</label>
                                                            <select
                                                                className="app-input w-full"
                                                                value={selectedSize}
                                                                onChange={(e) => setSelectedSize(e.target.value)}
                                                            >
                                                                <option value="">Choose size</option>
                                                                <option value={availableSize}>{availableSize}</option>
                                                            </select>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label className="block text-xs font-black uppercase tracking-widest text-muted mb-2">Quantity</label>
                                                        <select
                                                            value={qty}
                                                            onChange={(e) => setQty(Number(e.target.value))}
                                                            className="app-input w-full"
                                                        >
                                                            {qtyOptions.map((value) => (
                                                                <option key={value} value={value}>{value}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={addToCartHandler}
                                                        disabled={product.countInStock === 0 || (requiresSizeSelection && selectedSize !== availableSize)}
                                                        className="w-full app-btn py-3 font-black disabled:opacity-60 disabled:cursor-not-allowed"
                                                    >
                                                        {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                        </div>
                    </div>
                    </div>

        {/* REVIEWS SECTION */}
                <div id="reviews-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-app">
                    <div className="flex items-end justify-between gap-4 mb-6">
                        <div>
                            <h3 className="text-2xl font-black text-foreground">Customer Reviews</h3>
                            <p className="text-sm text-muted mt-1">Verified buyer feedback and post-purchase reviews</p>
                        </div>
                        <div className="text-sm font-black text-muted">{product.numReviews || 0} reviews</div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-8 items-start">
                        <div className="app-card p-6 sticky top-24">
                            <h4 className="text-xl font-black text-foreground mb-4">Share Your Review</h4>
                            {!userInfo ? (
                                <div className="text-center py-6">
                                    <p className="text-muted mb-4">Login to share your feedback</p>
                                    <Link to="/login" className="app-btn px-6 py-2 inline-block">Login</Link>
                                </div>
                            ) : (
                                <form onSubmit={submitReviewHandler} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-muted mb-2">Rating</label>
                                        <Rating
                                            value={rating}
                                            interactive
                                            onSelect={setRating}
                                            text={rating > 0 ? `${rating.toFixed(1)} out of 5 stars` : 'Tap a star to rate'}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-muted mb-2">Your Comment</label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Share your experience with this product..."
                                            className="app-input w-full h-28 resize-none"
                                        />
                                    </div>
                                    <button type="submit" disabled={loadingReview} className="w-full app-btn py-3 font-black disabled:opacity-60">
                                        {loadingReview ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </form>
                            )}
                        </div>

                        <div className="app-card p-6 lg:p-8">
                            {product.reviews && product.reviews.length > 0 ? (
                                <div className="space-y-6">
                                    {product.reviews.map((review, idx) => (
                                        <div key={idx} className="border-b border-app pb-6 last:border-b-0">
                                            <div className="flex justify-between items-start gap-4 mb-2">
                                                <div>
                                                    <p className="font-black text-foreground">{review.name}</p>
                                                    <div className="flex gap-1 mt-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i} className={i < review.rating ? 'text-primary' : 'text-muted'}>★</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-muted">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                    {canManageReviews && (
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteReviewHandler(review._id)}
                                                            disabled={deletingReviewId === review._id}
                                                            className="text-red-500 hover:text-red-600 disabled:opacity-50"
                                                            aria-label="Delete review"
                                                            title="Delete review"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted leading-relaxed mt-2">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-muted mb-2">No reviews yet</p>
                                    <p className="text-sm text-muted">Be the first to review this product!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

        </>
    );
};

export default ProductScreen;