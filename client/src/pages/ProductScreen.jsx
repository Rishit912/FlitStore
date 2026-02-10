import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { FaArrowLeft, FaHandshake, FaClock } from 'react-icons/fa';
import { addToCart } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import Rating from '../components/Rating';

const ProductScreen = () => {
    const [product, setProduct] = useState({ reviews: [] });
    const [qty, setQty] = useState(1);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loadingReview, setLoadingReview] = useState(false);

    const [offerPrice, setOfferPrice] = useState('');
    const [negotiatedPrice, setNegotiatedPrice] = useState(null);
    const [isHaggling, setIsHaggling] = useState(false);
    const [wishlistIds, setWishlistIds] = useState([]);

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
        const fetchWishlist = async () => {
            if (!userInfo) return;
            try {
                const { data } = await axios.get('/api/users/wishlist');
                setWishlistIds((data || []).map((item) => item._id));
            } catch (err) {
                toast.error(err?.response?.data?.message || 'Failed to load wishlist');
            }
        };

        fetchWishlist();
    }, [userInfo]);

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
        const finalPrice = negotiatedPrice ? negotiatedPrice : product.price;
        dispatch(addToCart({ ...product, price: finalPrice, originalPrice: product.price, qty }));
        navigate('/cart');
    };

    const toggleWishlist = async () => {
        if (!userInfo) {
            toast.error('Please login to use wishlist');
            navigate('/login');
            return;
        }

        try {
            if (wishlistIds.includes(product._id)) {
                const { data } = await axios.delete(`/api/users/wishlist/${product._id}`);
                setWishlistIds((data || []).map((item) => item._id));
                toast.info('Removed from wishlist');
            } else {
                const { data } = await axios.post('/api/users/wishlist', { productId: product._id });
                setWishlistIds((data || []).map((item) => item._id));
                toast.success('Added to wishlist');
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Wishlist update failed');
        }
    };

    const submitReviewHandler = async (e) => {
        e.preventDefault();
        if (!rating || !comment.trim()) {
            toast.error('Please add a rating and comment');
            return;
        }
        try {
            setLoadingReview(true);
            await axios.post(`/api/products/${id}/reviews`, { rating, comment });
            toast.success('Review submitted');
            setRating(0);
            setComment('');
            fetchProduct();
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        } finally {
            setLoadingReview(false);
        }
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

    const userReview = userInfo && product.reviews?.find((review) => review.user === userInfo._id);
    const hasReviewed = Boolean(userReview);
    const isReviewPending = Boolean(userReview && !userReview.isApproved);
    const visibleReviews = userInfo?.isAdmin
        ? product.reviews
        : (product.reviews || []).filter((review) => review.isApproved);

    return (
        <div className="fs-container fs-section">
            <Link to="/" className="flex items-center text-slate-500 hover:text-slate-900 mb-6 w-fit">
                <FaArrowLeft className="mr-2" /> Back to home
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">
                <div className="fs-card p-3">
                    <img src={product.image || '/placeholder-product.svg'} alt={product.name} className="w-full h-auto rounded-2xl" />
                </div>

                <div className="space-y-6">
                    <div>
                        <p className="fs-pill w-fit">Featured</p>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-3">{product.name}</h2>
                        <Rating value={product.rating} text={`${product.numReviews} reviews`} />
                    </div>

                    <div className="flex items-center gap-4">
                        {negotiatedPrice ? (
                            <>
                                <p className="text-3xl font-semibold text-emerald-600">₹{negotiatedPrice}</p>
                                <p className="text-lg text-slate-400 line-through">₹{product.price}</p>
                            </>
                        ) : (
                            <p className="text-3xl font-semibold text-sky-600">₹{product.price}</p>
                        )}
                    </div>

                    {dealActive && (
                        <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1 rounded-full w-fit border border-orange-100 animate-pulse">
                            <FaClock className="text-sm" />
                            <span className="text-xs font-black uppercase tracking-[0.2em]">
                                Deal Expires In: {formatTime(timer)}
                            </span>
                        </div>
                    )}
                    
                    <p className="text-slate-600 leading-relaxed">{product.description}</p>

                    <div className="fs-card p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-slate-500 uppercase tracking-[0.2em]">Status</span>
                            <span className={`font-semibold ${product.countInStock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>

                        {product.countInStock > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-slate-500 uppercase tracking-[0.2em]">Quantity</span>
                                <select 
                                    value={qty} 
                                    onChange={(e) => setQty(Number(e.target.value))}
                                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm"
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
                            className={`w-full py-3 rounded-full font-semibold transition-colors ${
                                product.countInStock === 0 
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                : 'bg-sky-600 text-white hover:bg-sky-700'
                            }`}
                        >
                            {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>

                        <button
                            type="button"
                            onClick={toggleWishlist}
                            className="w-full border border-slate-200 text-slate-700 py-3 rounded-full font-semibold hover:bg-slate-50 transition"
                        >
                            {wishlistIds.includes(product._id) ? 'Remove from Wishlist' : 'Save to Wishlist'}
                        </button>

                        {!negotiatedPrice && product.countInStock > 0 && (
                            <div className="pt-3 border-t border-slate-100">
                                {!isHaggling ? (
                                    <button 
                                        onClick={() => setIsHaggling(true)}
                                        className="w-full flex items-center justify-center gap-2 border border-slate-300 text-slate-800 py-2 rounded-full font-semibold text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition"
                                    >
                                        <FaHandshake className="text-base" /> Haggle with AI
                                    </button>
                                ) : (
                                    <form onSubmit={handleNegotiation} className="flex flex-col sm:flex-row gap-2">
                                        <input 
                                            type="number"
                                            placeholder="Your Offer ₹"
                                            className="fs-input"
                                            value={offerPrice}
                                            onChange={(e) => setOfferPrice(e.target.value)}
                                            required
                                        />
                                        <div className="flex gap-2">
                                            <button type="submit" className="fs-button-primary px-4 py-2 text-xs uppercase tracking-[0.2em]">Offer</button>
                                            <button type="button" onClick={() => setIsHaggling(false)} className="fs-button-ghost px-4 py-2 text-xs uppercase tracking-[0.2em]">Cancel</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="fs-card p-6">
                        <h3 className="text-xl font-semibold text-slate-900 mb-4">Customer Reviews</h3>
                        {visibleReviews && visibleReviews.length > 0 ? (
                            <div className="space-y-4">
                                {visibleReviews.map((review) => (
                                    <div key={review._id} className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-slate-900">{review.name}</p>
                                            <span className="text-xs text-slate-400">
                                                {review.createdAt?.substring(0, 10)}
                                            </span>
                                        </div>
                                        <Rating value={review.rating} text="" />
                                        <p className="text-sm text-slate-600">{review.comment}</p>
                                        {review.adminReply && (
                                            <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                                                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Admin reply</p>
                                                <p className="text-sm text-slate-600 mt-1">{review.adminReply}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">No reviews yet. Be the first to review.</p>
                        )}
                    </div>
                </div>

                <div className="fs-card p-6 h-fit">
                    <h3 className="text-xl font-semibold text-slate-900 mb-4">Write a Review</h3>
                    {!userInfo ? (
                        <p className="text-sm text-slate-600">Please sign in to leave a review.</p>
                    ) : hasReviewed ? (
                        <p className="text-sm text-slate-600">
                          {isReviewPending ? 'Your review is pending approval.' : 'You have already reviewed this product.'}
                        </p>
                    ) : (
                        <form onSubmit={submitReviewHandler} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Your Rating</label>
                                <Rating value={rating} onSelect={setRating} interactive={true} />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Your Review</label>
                                <textarea
                                    className="fs-input resize-none"
                                    rows={4}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Share what you loved..."
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loadingReview}
                                className="w-full fs-button-primary py-3"
                            >
                                {loadingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductScreen;