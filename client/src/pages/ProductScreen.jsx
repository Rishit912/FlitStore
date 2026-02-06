import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { FaArrowLeft, FaHandshake, FaClock } from 'react-icons/fa'; // 🟢 Added FaClock
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

    // 🟢 NEW STATES FOR TIMER
    const [timer, setTimer] = useState(600); // 600 seconds = 10 minutes
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

    // 🟢 TIMER EFFECT: Resets the price when time runs out
    useEffect(() => {
        let interval = null;
        if (dealActive && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setNegotiatedPrice(null);
            setDealActive(false);
            toast.error("The bargain deal has expired!");
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [dealActive, timer]);

    const addToCartHandler = () => {
        const finalPrice = negotiatedPrice ? negotiatedPrice : product.price;
        dispatch(addToCart({ ...product, price: finalPrice, qty }));
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
            // 🟢 START THE TIMER
            setDealActive(true);
            setTimer(600); 
        } else if (userOffer >= product.price) {
            toast.info("That's already the current price or higher!");
        } else {
            toast.error("AI says: That's too low! Try a better offer.");
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoadingReview(true);
        try {
            await axios.post(`/api/products/${id}/reviews`, { rating, comment });
            toast.success('Review submitted successfully!');
            setRating(0);
            setComment('');
            fetchProduct();
        } catch (err) {
            toast.error(err?.response?.data?.message || err.error);
        } finally {
            setLoadingReview(false);
        }
    };

    // Helper to format the time MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
                    <Rating value={product.rating} text={`${product.numReviews} reviews`} />

                    <div className="flex items-center gap-4 mb-2">
                        {negotiatedPrice ? (
                            <>
                                <p className="text-2xl font-bold text-green-600">₹{negotiatedPrice}</p>
                                <p className="text-lg text-gray-400 line-through">₹{product.price}</p>
                            </>
                        ) : (
                            <p className="text-2xl font-bold text-blue-600">₹{product.price}</p>
                        )}
                    </div>

                    {/* 🟢 VISUAL TIMER UI */}
                    {dealActive && (
                        <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1 rounded-full w-fit mb-4 border border-orange-100 animate-pulse">
                            <FaClock className="text-sm" />
                            <span className="text-xs font-black uppercase tracking-widest">
                                Deal Expires In: {formatTime(timer)}
                            </span>
                        </div>
                    )}
                    
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
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-400 mb-3"
                        >
                            Add to Cart
                        </button>

                        {!negotiatedPrice && product.countInStock > 0 && (
                            <div className="mt-2 border-t pt-4">
                                {!isHaggling ? (
                                    <button 
                                        onClick={() => setIsHaggling(true)}
                                        className="w-full flex items-center justify-center gap-2 border-2 border-gray-900 text-gray-900 py-2 rounded-lg font-black uppercase text-xs hover:bg-gray-50 transition"
                                    >
                                        <FaHandshake className="text-lg" /> Haggle with AI
                                    </button>
                                ) : (
                                    <form onSubmit={handleNegotiation} className="flex gap-2">
                                        <input 
                                            type="number"
                                            placeholder="Your Offer ₹"
                                            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                            value={offerPrice}
                                            onChange={(e) => setOfferPrice(e.target.value)}
                                            required
                                        />
                                        <button type="submit" className="bg-gray-900 text-white px-4 rounded-lg font-bold text-xs uppercase">Offer</button>
                                        <button type="button" onClick={() => setIsHaggling(false)} className="text-gray-400 text-xs font-bold uppercase">Cancel</button>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl">
                <h2 className="text-2xl font-black uppercase mb-6 tracking-tighter">Customer Reviews</h2>
                {/* ... Review items logic ... */}
            </div>
        </div>
    );
};

export default ProductScreen;