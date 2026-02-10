import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from 'react-toastify';
import { clearCartItems } from '../slices/cartSlice';

const PlaceOrderScreen = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch(); // <--- THIS was missing or undefined before
    
    const cart = useSelector((state) => state.cart);
    const { userInfo } = useSelector((state) => state.auth);

    // --- CALCULATOR LOGIC ---
    const safeCartItems = Array.isArray(cart.cartItems)
        ? cart.cartItems.filter((item) => item && (item._id || item.product))
        : [];
    const addDecimals = (num) => {
        const value = Number(num);
        if (Number.isNaN(value)) return '0.00';
        return (Math.round(value * 100) / 100).toFixed(2);
    };

    const itemsPrice = addDecimals(
        safeCartItems.reduce((acc, item) => acc + Number(item.price) * Number(item.qty), 0)
    );

    const shippingPrice = addDecimals(Number(itemsPrice) > 100 ? 0 : 10);
    const taxPrice = addDecimals(Number((0.15 * Number(itemsPrice)).toFixed(2)));
    const totalPrice = addDecimals(
        Number(itemsPrice) +
        Number(shippingPrice) +
        Number(taxPrice)
    );

    useEffect(() => {
        if (!cart.shippingAddress.address) {
            navigate('/shipping');
        } else if (!cart.paymentMethod) {
            navigate('/payment');
        }
    }, [navigate, cart.shippingAddress.address, cart.paymentMethod]);

    const placeOrderHandler = async () => {
        try {
            if (!userInfo) {
                toast.error("Session expired. Please login again.");
                navigate('/login');
                return;
            }

            if (safeCartItems.length !== (cart.cartItems || []).length) {
                toast.error('Cart has invalid items. Please remove and add them again.');
                return;
            }

            const orderItems = safeCartItems.map((item) => {
                const productId = item._id || item.product;
                return {
                    _id: productId,
                    name: item.name,
                    qty: item.qty,
                    image: item.image,
                    price: Number(item.price),
                    originalPrice: Number(item.originalPrice || item.price),
                    product: productId,
                };
            });

            const invalidItem = orderItems.find(
                (item) => !item.name || !item.image || !item.product || !item._id || Number.isNaN(item.price)
            );

            if (invalidItem) {
                toast.error('Cart has invalid items. Please remove and add them again.');
                return;
            }

            // Send Order to Backend (cookie-based auth)
            const aiDiscountTotal = orderItems.reduce((acc, item) => {
                const diff = Number(item.originalPrice) - Number(item.price);
                return diff > 0 ? acc + diff * Number(item.qty) : acc;
            }, 0);
            const aiDiscountItems = orderItems.filter(
                (item) => Number(item.originalPrice) > Number(item.price)
            ).length;

            const res = await fetch('/api/orders', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderItems,
                    shippingAddress: cart.shippingAddress,
                    paymentMethod: cart.paymentMethod,
                    itemsPrice: itemsPrice,
                    shippingPrice: shippingPrice,
                    taxPrice: taxPrice,
                    totalPrice: totalPrice,
                    discount: cart.discount || 0,
                    aiDiscountTotal,
                    aiDiscountItems,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            // 3. Success!
            dispatch(clearCartItems()); // Clear the cart
            navigate(`/order/${data._id}`); // Redirect to Order Details (We need to build this page!)
            toast.success("Order Placed Successfully!");

        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="fs-container fs-section">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black text-slate-900">Review Order</h1>
                <span className="fs-pill">Step 3 of 3</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT SIDE: Order Details */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Shipping Info */}
                    <div className="fs-card p-6">
                        <h2 className="text-xl font-semibold mb-4 text-slate-800">Shipping</h2>
                        <p className="text-slate-600">
                            <strong>Address: </strong>
                            {cart.shippingAddress.address}, {cart.shippingAddress.city},{' '}
                            {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
                        </p>
                    </div>

                    {/* Payment Info */}
                    <div className="fs-card p-6">
                        <h2 className="text-xl font-semibold mb-4 text-slate-800">Payment Method</h2>
                        <p className="text-slate-600">
                            <strong>Method: </strong>
                            {cart.paymentMethod}
                        </p>
                    </div>

                    {/* Order Items */}
                    <div className="fs-card p-6">
                        <h2 className="text-xl font-semibold mb-4 text-slate-800">Order Items</h2>
                        {safeCartItems.length === 0 ? (
                            <p>Your cart is empty</p>
                        ) : (
                            <div className="space-y-4">
                                {safeCartItems.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                                        <div className="flex items-center">
                                            <img src={item.image || '/placeholder-product.svg'} alt={item.name} className="w-16 h-16 object-cover rounded-xl mr-4" />
                                            <Link to={`/product/${item._id || item.product}`} className="text-sky-700 font-semibold hover:underline">
                                                {item.name}
                                            </Link>
                                        </div>
                                        <div className="text-slate-600">
                                            {item.qty} x ₹{item.price} = <strong>₹{(item.qty * item.price).toFixed(2)}</strong>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE: Order Summary */}
                <div className="fs-card p-6 h-fit">
                    <h2 className="text-2xl font-semibold mb-6 text-slate-900">Order Summary</h2>

                    <div className="space-y-3 text-slate-600">
                        <div className="flex justify-between">
                            <span>Items</span>
                            <span>₹{itemsPrice}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>₹{shippingPrice}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax</span>
                            <span>₹{taxPrice}</span>
                        </div>
                        <div className="border-t border-slate-100 pt-3 mt-3 flex justify-between text-xl font-semibold text-slate-900">
                            <span>Total</span>
                            <span>₹{totalPrice}</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="w-full fs-button-primary py-3 mt-8"
                        onClick={placeOrderHandler}
                    >
                        Place Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrderScreen;