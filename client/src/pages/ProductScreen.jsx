import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // Added useSelector
import axios from 'axios';
import { FaArrowLeft } from 'react-icons/fa';
import { addToCart } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import Rating from '../components/Rating'; // Import the Rating component we created

const ProductScreen = () => {
    const [product, setProduct] = useState({ reviews: [] });
    const [qty, setQty] = useState(1);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loadingReview, setLoadingReview] = useState(false);

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

    const addToCartHandler = () => {
        dispatch(addToCart({ ...product, qty }));
        navigate('/cart');
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoadingReview(true);
        try {
            // 🟢 Send review to the backend route we created
            await axios.post(`/api/products/${id}/reviews`, { rating, comment });
            toast.success('Review submitted successfully!');
            setRating(0);
            setComment('');
            fetchProduct(); // Refresh product data to show the new review
        } catch (err) {
            toast.error(err?.response?.data?.message || err.error);
        } finally {
            setLoadingReview(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 mb-6 w-fit">
                <FaArrowLeft className="mr-2" /> Go Back
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
                <div className="bg-white rounded-xl shadow-lg p-2">
                    <img src={product.image} alt={product.name} className="w-full h-auto rounded-lg" />
                </div>

                <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h2>
                    
                    {/* 🟢 Star Rating Display */}
                    <Rating value={product.rating} text={`${product.numReviews} reviews`} />

                    <p className="text-2xl font-bold text-blue-600 mb-4">₹{product.price}</p>
                    <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-semibold text-gray-700">Status:</span>
                            <span className={`font-bold ${product.countInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>

                        {product.countInStock > 0 && (
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-semibold text-gray-700">Quantity:</span>
                                <select 
                                    value={qty} 
                                    onChange={(e) => setQty(Number(e.target.value))}
                                    className="border rounded-md px-3 py-1"
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
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>

            {/* --- REVIEWS SECTION --- */}
            <div className="max-w-4xl">
                <h2 className="text-2xl font-black uppercase mb-6 tracking-tighter">Customer Reviews</h2>
                
                {product.reviews.length === 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg text-gray-500 font-bold uppercase text-xs mb-6">No Reviews Yet</div>
                )}

                <div className="space-y-6 mb-10">
                    {product.reviews.map((review) => (
                        <div key={review._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                                <strong className="text-gray-800 uppercase text-sm font-black tracking-tight">{review.name}</strong>
                                <span className="text-gray-400 text-[10px] font-bold">{review.createdAt.substring(0, 10)}</span>
                            </div>
                            <Rating value={review.rating} />
                            <p className="text-gray-600 text-sm mt-2">{review.comment}</p>
                        </div>
                    ))}
                </div>

                {/* 🟢 Review Form: Only for logged-in users */}
                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200">
                    <h3 className="text-lg font-black uppercase mb-4 tracking-tight">Write a Review</h3>
                    {userInfo ? (
                        <form onSubmit={submitHandler} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Select Rating</label>
                                <div className="p-4 border border-gray-200 rounded-2xl">
                                    <Rating value={rating} onSelect={setRating} interactive />
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                                        {rating ? `${rating} star${rating > 1 ? 's' : ''}` : 'Click a star to rate'}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Your Feedback</label>
                                <textarea
                                    rows="4"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tell others what you think of this product..."
                                    className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    required
                                ></textarea>
                            </div>
                            <button 
                                disabled={loadingReview}
                                type="submit" 
                                className="bg-gray-900 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition active:scale-95 disabled:bg-gray-400"
                            >
                                {loadingReview ? 'Submitting...' : 'Post Review'}
                            </button>
                        </form>
                    ) : (
                        <div className="bg-blue-100 text-blue-800 p-4 rounded-2xl font-bold text-sm">
                            Please <Link to="/login" className="underline">Sign In</Link> to share your experience.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductScreen;