import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useDispatch, useSelector } from 'react-redux';
import { deliverOrder } from '../actions/orderActions';
import { ORDER_DELIVER_RESET } from '../constants/orderConstants';

const OrderScreen = () => {
  const { id: orderId } = useParams();
  const dispatch = useDispatch();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paypalClientId, setPaypalClientId] = useState('');
  const [razorpayKeyId, setRazorpayKeyId] = useState('');

  const orderDeliver = useSelector((state) => state.orderDeliver);
  const { loading: loadingDeliver, success: successDeliver } = orderDeliver;

  const { userInfo } = useSelector((state) => state.auth);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
  };

  useEffect(() => {
    const fetchOrderAndConfig = async () => {
      try {
                const res = await fetch(`/api/orders/${orderId}`, {
                    credentials: 'include',
                });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message);
        
        setOrder(data);
        setLoading(false);

        if (!data.isPaid) {
            try {
                const resPaypal = await fetch('/api/config/paypal');
                const paypalData = await resPaypal.json();
                setPaypalClientId(paypalData.clientId);
            } catch (err) { }

            try {
                const resRazorpay = await fetch('/api/config/razorpay');
                const razorpayData = await resRazorpay.json();
                setRazorpayKeyId(razorpayData.key);
            } catch (err) { }
        }

      } catch (err) {
        toast.error(err.message);
        setLoading(false);
      }
    };

    if (successDeliver) {
        dispatch({ type: ORDER_DELIVER_RESET });
        fetchOrderAndConfig();
    } else {
        fetchOrderAndConfig();
    }

  }, [orderId, successDeliver, dispatch]);

  const handleRazorpayPayment = async () => {
    if (!razorpayKeyId) {
        toast.error("Razorpay Key not found.");
        return;
    }
    const totalAmount = Number(order?.totalPrice);
    if (!totalAmount || Number.isNaN(totalAmount)) {
        toast.error('Invalid order amount.');
        return;
    }
    const res = await loadRazorpayScript();
    if (!res) {
        toast.error('Razorpay SDK failed to load.');
        return;
    }
    try {
        const result = await fetch('/api/razorpay', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: totalAmount }),
        });
        const data = await result.json();
        if (!data) return;

        const options = {
            key: razorpayKeyId,
            amount: data.amount,
            currency: data.currency || 'INR',
            name: "FlitStore",
            description: `Payment for Order #${order._id}`,
            order_id: data.id, 
            method: {
                upi: true,
                card: true,
                netbanking: true,
                wallet: true,
            },
            prefill: {
                name: order?.user?.name,
                email: order?.user?.email,
            },
            handler: async function (response) {
                 const payRes = await fetch(`/api/orders/${orderId}/pay`, {
                    method: 'PUT',
                          credentials: 'include',
                          headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: response.razorpay_payment_id,
                        status: 'COMPLETED',
                        update_time: new Date().toISOString(),
                        payer: { email_address: order.user.email }
                    }),
                });
                const updatedOrder = await payRes.json();
                setOrder(updatedOrder);
                toast.success('Payment Successful!');
            },
            prefill: { name: order.user.name, email: order.user.email },
            theme: { color: "#2563eb" },
        };
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    } catch (err) { toast.error(err.message); }
  };

  const deliverHandler = () => {
    dispatch(deliverOrder(order));
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (!order) return <div className="text-center mt-20 text-red-500">Order Not Found</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900">Order #{order._id.substring(0, 10)}...</h1>
                <p className="text-gray-500 text-sm mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div className={`mt-4 md:mt-0 px-4 py-2 rounded-full font-bold text-sm ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {order.isPaid ? 'Payment Complete' : 'Payment Pending'}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Status</h2>
                    <div className="relative">
                        <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>
                        <ul className="space-y-6 relative">
                            <li className="flex items-center">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs z-10">✓</div>
                                <div className="ml-4">
                                    <p className="font-medium text-gray-900">Order Placed</p>
                                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</p>
                                </div>
                            </li>
                            <li className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs z-10 ${order.isPaid ? 'bg-green-500' : 'bg-gray-300'}`}>
                                    {order.isPaid ? '✓' : '2'}
                                </div>
                                <div className="ml-4">
                                    <p className={`font-medium ${order.isPaid ? 'text-gray-900' : 'text-gray-400'}`}>Payment Confirmed</p>
                                    {order.isPaid && <p className="text-xs text-gray-500">{order.paidAt.substring(0, 10)}</p>}
                                </div>
                            </li>
                            <li className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs z-10 ${order.isDelivered ? 'bg-green-500' : 'bg-gray-300'}`}>
                                    {order.isDelivered ? '✓' : '3'}
                                </div>
                                <div className="ml-4">
                                    <p className={`font-medium ${order.isDelivered ? 'text-gray-900' : 'text-gray-400'}`}>Delivered</p>
                                    {order.isDelivered ? (
                                        <p className="text-xs text-gray-500">{order.deliveredAt.substring(0, 10)}</p>
                                    ) : (
                                        <p className="text-xs text-orange-500 font-medium animate-pulse">In Progress...</p>
                                    )}
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Items in Your Order</h2>
                    <div className="divide-y divide-gray-100">
                        {order.orderItems.map((item, index) => (
                            <div key={index} className="flex py-4">
                                <img src={item.image} alt={item.name} className="h-20 w-20 object-cover rounded-md border border-gray-200" />
                                <div className="ml-4 flex-1">
                                    <Link to={`/product/${item.product}`} className="text-blue-600 font-medium hover:underline">
                                        {item.name}
                                    </Link>
                                    <p className="text-gray-500 text-sm mt-1">Quantity: {item.qty}</p>
                                    <p className="text-gray-900 font-bold mt-1">₹{item.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                     <h2 className="text-lg font-semibold text-gray-800 mb-4">Shipping Details</h2>
                     <div className="text-gray-600 text-sm space-y-1">
                        <p><span className="font-medium text-gray-900">Recipient:</span> {order.user.name}</p>
                        <p><span className="font-medium text-gray-900">Email:</span> {order.user.email}</p>
                        <p><span className="font-medium text-gray-900">Address:</span> {order.shippingAddress.address}, {order.shippingAddress.city} - {order.shippingAddress.postalCode}</p>
                     </div>
                </div>
                
                 {/* Map Component */}
             
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-fit">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Summary</h2>
                    <div className="space-y-3 border-b border-gray-100 pb-4 mb-4">
                        <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.itemsPrice}</span></div>
                        <div className="flex justify-between text-gray-600"><span>Shipping</span><span>₹{order.shippingPrice}</span></div>
                        <div className="flex justify-between text-gray-600"><span>Tax</span><span>₹{order.taxPrice}</span></div>
                    </div>
                    <div className="flex justify-between items-center text-xl font-bold text-gray-900 mb-6">
                        <span>Total</span>
                        <span>₹{order.totalPrice}</span>
                    </div>

                    {!order.isPaid ? (
                        <div className="mt-4 space-y-3">
                             <button onClick={handleRazorpayPayment} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2">
                                <span>Pay with Razorpay</span>
                             </button>
                             {paypalClientId && (
                                <PayPalScriptProvider options={{ "client-id": paypalClientId }}>
                                    <PayPalButtons createOrder={(data, actions) => actions.order.create({ purchase_units: [{ amount: { value: order.totalPrice } }] })} onApprove={(data, actions) => actions.order.capture().then(async (details) => { window.location.reload(); })} />
                                </PayPalScriptProvider>
                            )}
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                            <p className="text-green-700 font-medium">Payment Successful</p>
                        </div>
                    )}

                    {/* THIS IS THE BUTTON */}
                   {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
    <button
        type="button"
        className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-black transition mt-4"
        onClick={deliverHandler}
    >
        {loadingDeliver ? 'Updating...' : 'Mark As Delivered'}
    </button>
)}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OrderScreen;