import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from 'react-toastify';
import { clearCartItems } from '../slices/cartSlice';

const PlaceOrderScreen = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch(); // <--- THIS was missing or undefined before
    const GST_RATE = 0.18;
    
    const cart = useSelector((state) => state.cart);
    const { userInfo } = useSelector((state) => state.auth);

    // --- CALCULATOR LOGIC ---
    const addDecimals = (num) => {
        const value = Number(num);
        if (Number.isNaN(value)) return '0.00';
        return (Math.round(value * 100) / 100).toFixed(2);
    };

    const actualItemsPrice = addDecimals(
        cart.cartItems.reduce((acc, item) => acc + Number(item.originalPrice ?? item.price) * Number(item.qty), 0)
    );
    const itemsPrice = addDecimals(
        cart.cartItems.reduce((acc, item) => acc + Number(item.price) * Number(item.qty), 0)
    );
    const haggleSavings = addDecimals(Number(actualItemsPrice) - Number(itemsPrice));

    const shippingPrice = addDecimals(Number(itemsPrice) > 499 ? 0 : 49);
    const taxPrice = addDecimals(Number((GST_RATE * Number(itemsPrice)).toFixed(2)));
    const cgstPrice = addDecimals(Number(taxPrice) / 2);
    const sgstPrice = addDecimals(Number(taxPrice) / 2);
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

            const orderItems = cart.cartItems.map((item) => {
                const productId = item._id || item.product;
                return {
                    _id: productId,
                    name: item.name,
                    qty: item.qty,
                    image: item.image,
                    price: Number(item.price),
                    originalPrice: Number(item.originalPrice ?? item.price),
                    isHaggled: Boolean(item.isHaggled),
                    size: item.size || '',
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
                                        discount: Number(cart.discount || 0),
                                        pricingMeta: {
                                            actualItemsPrice,
                                            haggleSavings,
                                            cgstPrice,
                                            sgstPrice,
                                        },
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-8 text-foreground">Review Order</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT SIDE: Order Details */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Shipping Info */}
                    <div className="app-card p-6">
                        <h2 className="text-xl font-bold mb-4 text-foreground">Shipping</h2>
                        <p className="text-muted">
                            <strong>Address: </strong>
                            {cart.shippingAddress.address}, {cart.shippingAddress.city},{' '}
                            {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
                        </p>
                    </div>

                    {/* Payment Info */}
                    <div className="app-card p-6">
                        <h2 className="text-xl font-bold mb-4 text-foreground">Payment Method</h2>
                        <p className="text-muted">
                            <strong>Method: </strong>
                            {cart.paymentMethod}
                        </p>
                    </div>

                    {/* Order Items */}
                    <div className="app-card p-6">
                        <h2 className="text-xl font-bold mb-4 text-foreground">Order Items</h2>
                        {cart.cartItems.length === 0 ? (
                            <p className="text-muted">Your cart is empty</p>
                        ) : (
                            <div className="space-y-4">
                                {cart.cartItems.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0">
                                        <div className="flex items-center">
                                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded mr-4" />
                                            <Link to={`/product/${item._id}`} className="text-primary font-medium hover:underline">
                                                {item.name}
                                            </Link>
                                        </div>
                                        <div className="text-muted">
                                            {item.size && (
                                                <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700 mb-1">Size: {item.size}</p>
                                            )}
                                                                                        {item.qty} x ₹{Number(item.price).toFixed(2)} = <strong>₹{(item.qty * item.price).toFixed(2)}</strong>
                                                                                        {item.isHaggled && (
                                                                                            <p className="text-xs text-accent-1 mt-1 font-semibold">
                                                                                                Haggle Applied (Original ₹{Number(item.originalPrice).toFixed(2)})
                                                                                            </p>
                                                                                        )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE: Order Summary */}
                <div className="app-card p-6 h-fit">
                    <h2 className="text-2xl font-bold mb-6 text-foreground">Order Summary</h2>

                    <div className="space-y-3 text-muted">
                        <div className="flex justify-between">
                            <span>Actual Item Price</span>
                            <span>₹{actualItemsPrice}</span>
                        </div>
                        {Number(haggleSavings) > 0 && (
                          <div className="flex justify-between text-accent-1 font-bold">
                              <span>Haggle Savings</span>
                              <span>-₹{haggleSavings}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                            <span>Taxable Item Value</span>
                            <span>₹{itemsPrice}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>{Number(shippingPrice) === 0 ? 'Free' : `₹${shippingPrice}`}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>CGST (9%)</span>
                            <span>₹{cgstPrice}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>SGST (9%)</span>
                            <span>₹{sgstPrice}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total GST (18%)</span>
                            <span>₹{taxPrice}</span>
                        </div>
                        <div className="border-t border-app pt-3 mt-3 flex justify-between text-xl font-bold text-foreground">
                            <span>Total</span>
                            <span>₹{totalPrice}</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="w-full app-btn py-3 mt-8"
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