import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { FaArrowLeft, FaHandshake, FaClock, FaTrash } from 'react-icons/fa';
import { addToCart } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import Rating from '../components/Rating';
import ARTryOnModal from '../components/ARTryOnModal.jsx';

const ProductScreen = () => {
    const [product, setProduct] = useState({ reviews: [] });
    const [qty, setQty] = useState(1);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loadingReview, setLoadingReview] = useState(false);
    const [deletingReviewId, setDeletingReviewId] = useState(null);
    const [arOpen, setArOpen] = useState(false);

    const [offerPrice, setOfferPrice] = useState('');
    const [negotiatedPrice, setNegotiatedPrice] = useState(null);
    const [isHaggling, setIsHaggling] = useState(false);

    const [timer, setTimer] = useState(600); 
    const [dealActive, setDealActive] = useState(false);

    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { userInfo } = useSelector((state) => state.auth);

    const fetchProduct = async () => {
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    useEffect(() => {
        let interval = null;
        if (dealActive && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setNegotiatedPrice(null);
            setDealActive(false);
            setTimer(600);
            toast.error("The bargain deal has expired!");
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [dealActive, timer]);

    const addToCartHandler = () => {
        if (product.countInStock === 0) {
            toast.error('Item is out of stock');
            return;
        }
        const finalPrice = negotiatedPrice ? negotiatedPrice : product.price;
        dispatch(addToCart({
            ...product,
            price: Number(finalPrice),
            originalPrice: Number(product.price),
            isHaggled: Boolean(negotiatedPrice),
            qty,
        }));
        navigate('/cart');
    };

    const handleNegotiation = (e) => {
        e.preventDefault();
        const userOffer = Number(offerPrice);
        const minPrice = product.price * 0.90;

        if (userOffer >= minPrice && userOffer < product.price) {
            toast.success(`🤝 Deal! FlitStore AI accepted your offer of ₹${userOffer}`);
            setNegotiatedPrice(userOffer);
            setIsHaggling(false);
            setDealActive(true);
            setTimer(600); 
        } else if (userOffer >= product.price) {
            toast.info("That's already the current price or higher!");
        } else {
            toast.error("AI says: That's too low! Try a better offer.");
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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

    return (
        <>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link to="/" className="flex items-center text-muted hover:text-foreground mb-6 w-fit">
                <FaArrowLeft className="mr-2" /> Go Back
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
                <div className="app-card p-2">
                    <img
                        src={product.image && product.image.trim() !== '' ? `${product.image}?t=${new Date(product.updatedAt).getTime()}` : `https://source.unsplash.com/600x400/?${encodeURIComponent(product.name || 'product')},shopping`}
                        alt={product.name}
                        className="w-full h-auto rounded-lg bg-app"
                        onError={e => { e.target.onerror = null; e.target.src = '/default-product.png'; }}
                    />
                </div>

                <div>
                    <h2 className="text-3xl font-bold text-foreground mb-4">{product.name}</h2>
                    <Rating value={product.rating} text={`${product.numReviews} reviews`} />

                    <div className="flex items-center gap-4 mb-2 mt-4">
                        {negotiatedPrice ? (
                            <>
                                <p className="text-2xl font-bold text-accent-1">₹{negotiatedPrice}</p>
                                <p className="text-lg text-muted line-through">₹{product.price}</p>
                                <p className="text-sm font-black text-accent-1 bg-accent-1/10 px-3 py-1 rounded-full">
                                  DEAL! {Math.round((1 - (negotiatedPrice / product.price)) * 100)}% OFF
                                </p>
                            </>
                        ) : (
                            <p className="text-2xl font-bold text-primary">₹{product.price}</p>
                        )}
                    </div>

                    {dealActive && (
                        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-full w-fit mb-4 border border-amber-100 animate-pulse">
                            <FaClock className="text-sm" />
                            <span className="text-xs font-black uppercase tracking-widest">
                                Deal Expires In: {formatTime(timer)}
                            </span>
                        </div>
                    )}

                    {product.countInStock > 0 && !negotiatedPrice && (
                        <div className="bg-accent-1/10 border border-accent-1/30 rounded-xl p-3 mb-6">
                            <p className="text-sm text-foreground font-bold">
                                💡 <span className="text-accent-1">Pro Tip:</span> Use the "Haggle with AI" button to negotiate up to 10% off this price!
                            </p>
                        </div>
                    )}
                    
                    <p className="text-muted leading-relaxed mb-6">{product.description}</p>

                    <div className="app-card p-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-semibold text-muted">Status:</span>
                            <span className={`font-bold ${product.countInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>

                        {product.countInStock > 0 && (
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-semibold text-muted">Quantity:</span>
                                <select 
                                    value={qty} 
                                    onChange={(e) => setQty(Number(e.target.value))}
                                    className="app-input"
                                >
                                    {[...Array(product.countInStock).keys()].map((x) => (
                                        <option key={x + 1} value={x + 1}>{x + 1}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button 
                            onClick={addToCartHandler}
                            disabled={product.countInStock === 0}
                            className={`w-full py-3 rounded-lg font-bold transition-colors mb-4 ${
                                product.countInStock === 0 
                                ? 'bg-surface-2 text-muted cursor-not-allowed' 
                                : 'app-btn'
                            }`}
                        >
                            {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <button
                              type="button"
                              onClick={() => setArOpen(true)}
                              className="w-full py-3 rounded-lg font-bold border-2 border-primary text-primary bg-primary/5 hover:bg-primary/10 transition flex items-center justify-center gap-2 uppercase text-sm tracking-wide"
                          >
                              <span>📱</span>
                              Try in AR (Beta)
                          </button>

                          {product.countInStock > 0 && !negotiatedPrice && (
                              <button 
                                  onClick={() => setIsHaggling(true)}
                                  className="w-full py-3 rounded-lg font-bold border-2 border-accent-1 text-accent-1 bg-accent-1/5 hover:bg-accent-1/10 transition flex items-center justify-center gap-2 uppercase text-sm tracking-wide"
                              >
                                  <span>🤝</span>
                                  Haggle with AI
                              </button>
                          )}
                        </div>

                        {/* 🟢 Haggle section - shown as form when button is clicked */}
                        {!negotiatedPrice && product.countInStock > 0 && isHaggling && (
                            <div className="mt-4 border-t pt-4 space-y-3">
                                <div className="flex items-center gap-2 text-sm font-bold text-accent-1 mb-3">
                                    <FaHandshake /> Make your offer below
                                </div>
                                <form onSubmit={handleNegotiation} className="space-y-2">
                                    <input 
                                        type="number"
                                        placeholder="Your Offer ₹"
                                        className="app-input w-full"
                                        value={offerPrice}
                                        onChange={(e) => setOfferPrice(e.target.value)}
                                        required
                                    />
                                    <div className="flex gap-2">
                                        <button type="submit" className="app-btn py-2 px-4 flex-1 text-sm font-bold">Submit Offer</button>
                                        <button type="button" onClick={() => setIsHaggling(false)} className="border border-app text-muted bg-surface-2 hover:bg-surface px-4 py-2 rounded-lg text-sm font-bold transition">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* REVIEWS SECTION */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-app">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Write Review Form */}
                <div className="lg:col-span-1">
                    <div className="app-card p-6 sticky top-24">
                        <h3 className="text-xl font-black text-foreground mb-4">Share Your Review</h3>
                        {!userInfo ? (
                            <div className="text-center py-6">
                                <p className="text-muted mb-4">Login to share your feedback</p>
                                <Link to="/login" className="app-btn px-6 py-2 inline-block">
                                    Login
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={submitReviewHandler} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-muted mb-2">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((r) => (
                                            <button
                                                key={r}
                                                type="button"
                                                onClick={() => setRating(r)}
                                                className={`text-2xl transition-transform ${rating >= r ? 'text-primary scale-110' : 'text-muted'}`}
                                            >
                                                ⭐
                                            </button>
                                        ))}
                                    </div>
                                    {rating > 0 && <p className="text-xs text-muted mt-1">{rating} out of 5 stars</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-muted mb-2">Your Comment</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Share your experience with this product..."
                                        className="app-input w-full h-24 resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loadingReview}
                                    className="w-full app-btn py-3 font-bold disabled:opacity-60"
                                >
                                    {loadingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Display Reviews */}
                <div className="lg:col-span-2">
                    <div className="app-card p-6">
                        <h3 className="text-xl font-black text-foreground mb-6">
                            Customer Reviews ({product.numReviews || 0})
                        </h3>
                        {product.reviews && product.reviews.length > 0 ? (
                            <div className="space-y-6">
                                {product.reviews.map((review, idx) => (
                                    <div key={idx} className="border-b border-app pb-6 last:border-b-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-black text-foreground">{review.name}</p>
                                                <div className="flex gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={i < review.rating ? 'text-primary' : 'text-muted'}>★</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-muted">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </span>
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
        </div>

                <ARTryOnModal
                    open={arOpen}
                    onClose={() => setArOpen(false)}
                    imageSrc={product.image}
                    productName={product.name}
                />
        </>
    );
};

export default ProductScreen;