import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { jsPDF } from 'jspdf'; 
import autoTable from 'jspdf-autotable'; // 🟢 FIXED: Import as a standalone function
import { deliverOrder } from '../actions/orderActions';
import { ORDER_DELIVER_RESET } from '../constants/orderConstants';
import { applyDiscount } from '../slices/cartSlice';
import { FaWhatsapp, FaTicketAlt, FaFilePdf, FaCheckCircle, FaRegCircle, FaTruck, FaCreditCard } from 'react-icons/fa'; 

const OrderScreen = () => {
  const { id: orderId } = useParams();
  const dispatch = useDispatch();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paypalClientId, setPaypalClientId] = useState('');
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [couponCode, setCouponCode] = useState('');

  const cart = useSelector((state) => state.cart);
  const { discount } = cart;

  const orderDeliver = useSelector((state) => state.orderDeliver);
  const { loading: loadingDeliver, success: successDeliver } = orderDeliver;

  const { userInfo } = useSelector((state) => state.auth);

  // 🟢 FIXED INVOICE LOGIC
  const downloadInvoice = () => {
    const doc = new jsPDF();
    const discountAmt = (order.totalPrice * (discount / 100));
    const finalCalculatedTotal = order.totalPrice - discountAmt;

    // Header & Branding
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text('FlitStore', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Order ID: ${order._id}`, 14, 28);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 34);

    // Billing Details
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Bill To:', 14, 50);
    doc.setFontSize(10);
    doc.text(`${order.user.name}`, 14, 56);
    doc.text(`${order.shippingAddress.address}`, 14, 62);
    doc.text(`${order.shippingAddress.city} - ${order.shippingAddress.postalCode}`, 14, 68);

    // Items Table
    const tableColumn = ["Product", "Qty", "Price", "Total"];
    const tableRows = order.orderItems.map(item => [
      item.name,
      item.qty,
      `INR ${item.price}`,
      `INR ${item.qty * item.price}`
    ]);

    // 🟢 FIXED: Use autoTable(doc, ...) instead of doc.autoTable(...)
    autoTable(doc, {
      startY: 80,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });

    // Totals Section using lastAutoTable positioning
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Subtotal: INR ${order.itemsPrice}`, 140, finalY);
    
    if (discount > 0) {
      doc.setTextColor(34, 197, 94);
      doc.text(`Discount (${discount}%): -INR ${discountAmt.toFixed(2)}`, 140, finalY + 7);
    }

    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.text(`Grand Total: INR ${finalCalculatedTotal.toFixed(2)}`, 140, finalY + 16);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Thank you for shopping with FlitStore - Powered by FlitStore', 105, 285, { align: 'center' });

    doc.save(`FlitStore_Invoice_${order._id.substring(0, 6)}.pdf`);
  };

  const trackOnWhatsApp = () => {
    const phoneNumber = "9909345049"; 
    const message = `Hello FlitStore Support! I want to track my Order ID: ${order._id}. It was placed on ${new Date(order.createdAt).toLocaleDateString()}.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  const applyCouponHandler = async () => {
    try {
      const { data } = await axios.post('/api/coupons/validate', { code: couponCode });
      dispatch(applyDiscount(data.discount));
      toast.success(`${data.discount}% Discount Applied!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid Code');
    }
  };

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
        const res = await fetch(`/api/orders/${orderId}`, { credentials: 'include' });
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
    }
    fetchOrderAndConfig();
  }, [orderId, successDeliver, dispatch]);

  const handleRazorpayPayment = async () => {
    if (!razorpayKeyId) {
        toast.error("Razorpay Key not found.");
        return;
    }

    const baseAmount = Number(order?.totalPrice);
    const discountAmount = (baseAmount * (discount / 100));
    const finalTotal = baseAmount - discountAmount;

    if (!finalTotal || Number.isNaN(finalTotal)) {
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
            body: JSON.stringify({ amount: finalTotal }), 
        });

        if (!result.ok) {
            const errorText = await result.text();
            throw new Error(errorText || 'Failed to create Razorpay order');
        }

        const data = await result.json();
        if (!data) return;

        const options = {
            key: razorpayKeyId,
            amount: data.amount,
            currency: data.currency || 'INR',
            name: "FlitStore",
            description: `Payment for Order #${order._id}`,
            order_id: data.id, 
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
            theme: { color: "#2563eb" },
        };
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    } catch (err) { 
        toast.error(err.message || 'Payment initiation failed'); 
    }
  };

  const deliverHandler = () => {
    dispatch(deliverOrder(order));
  };

  const trackingLink = (token) => `${window.location.origin}/track/${token}`;

  const copyTrackingLink = async () => {
    if (!order?.trackingToken) return;
    try {
      await navigator.clipboard.writeText(trackingLink(order.trackingToken));
      toast.success('Tracking link copied');
    } catch (error) {
      window.prompt('Copy tracking link:', trackingLink(order.trackingToken));
    }
  };

  const whatsappShare = () => {
    if (!order?.trackingToken) return;
    const link = trackingLink(order.trackingToken);
    const message = `Your FlitStore order tracking link: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const regenerateTrackingToken = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/tracking-token`, {
        method: 'PUT',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate tracking link');
      setOrder((prev) => ({ ...prev, trackingToken: data.trackingToken }));
      toast.success('Tracking link updated');
    } catch (err) {
      toast.error(err.message || 'Tracking update failed');
    }
  };

  const cancelOrderHandler = async () => {
    if (!order) return;
    const reason = window.prompt('Reason for cancellation (optional):');

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to cancel order');
      setOrder(data);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.message || 'Cancel failed');
    }
  };

  const markRefundHandler = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/refund`, {
        method: 'PUT',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to mark refund');
      setOrder(data);
      toast.success('Refund marked as processed');
    } catch (err) {
      toast.error(err.message || 'Refund update failed');
    }
  };

  const returnOrderHandler = async () => {
    if (!order) return;
    const reason = window.prompt('Reason for return (optional):');

    try {
      const res = await fetch(`/api/orders/${orderId}/return`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to request return');
      setOrder(data);
      toast.success('Return requested');
    } catch (err) {
      toast.error(err.message || 'Return failed');
    }
  };

  const markReturnRefundHandler = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/return/refund`, {
        method: 'PUT',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to mark return refund');
      setOrder(data);
      toast.success('Return refund processed');
    } catch (err) {
      toast.error(err.message || 'Return refund failed');
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (!order) return <div className="text-center mt-20 text-red-500">Order Not Found</div>;

  const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');
  const isOwner = userInfo && order?.user && userInfo._id === order.user._id;
  const returnWindowMs = 7 * 24 * 60 * 60 * 1000;
  const deliveredAtMs = order?.deliveredAt ? new Date(order.deliveredAt).getTime() : 0;
  const canReturn = isOwner && order?.isDelivered && !order?.isCancelled && !order?.isReturned && deliveredAtMs && (Date.now() - deliveredAtMs <= returnWindowMs);
  const shippedDate = order.isPaid ? (order.paidAt || order.createdAt) : null;
  const estimatedDelivery = order.isDelivered
    ? order.deliveredAt
    : order.isPaid
      ? new Date(new Date(order.createdAt).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString()
      : null;
  const trackingId = order._id ? order._id.substring(0, 8).toUpperCase() : '—';

  return (
    <div className="py-10">
      <div className="fs-container max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
          <h1 className="text-3xl font-black text-slate-900">Order #{order._id.substring(0, 10)}...</h1>
          <p className="text-slate-500 text-sm mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
        <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end gap-2">
          <div className={`px-4 py-2 rounded-full font-semibold text-sm ${order.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {order.isPaid ? 'Payment Complete' : 'Payment Pending'}
          </div>
          {order.isCancelled && (
            <div className="px-4 py-2 rounded-full font-semibold text-sm bg-rose-100 text-rose-700">
              Order Cancelled
            </div>
          )}
        </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
          <div className="fs-card p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Items in Your Order</h2>
            <div className="divide-y divide-slate-100">
                        {order.orderItems.map((item, index) => (
                            <div key={index} className="flex py-4">
                  <img src={item.image || '/placeholder-product.svg'} alt={item.name} className="h-20 w-20 object-cover rounded-xl border border-white/80" />
                                <div className="ml-4 flex-1">
                    <Link to={`/product/${item.product}`} className="text-sky-700 font-semibold hover:underline">
                                        {item.name}
                                    </Link>
                    <p className="text-slate-500 text-sm mt-1">Quantity: {item.qty}</p>
                    <p className="text-slate-900 font-semibold mt-1">₹{item.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

          <div className="fs-card p-6">
             <h2 className="text-lg font-semibold text-slate-800 mb-4">Shipping Details</h2>
             <div className="text-slate-600 text-sm space-y-1">
              <p><span className="font-semibold text-slate-900">Recipient:</span> {order.user.name}</p>
              <p><span className="font-semibold text-slate-900">Email:</span> {order.user.email}</p>
              <p><span className="font-semibold text-slate-900">Address:</span> {order.shippingAddress.address}, {order.shippingAddress.city} - {order.shippingAddress.postalCode}</p>
                     </div>
                </div>
            </div>

            <div className="space-y-6">
          <div className="fs-card p-6 h-fit">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Payment Summary</h2>
                    <div className="mb-6">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-4">Order Timeline</p>
                      <div className="space-y-5">
                        {order.isCancelled && (
                          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                            <p className="text-sm font-semibold text-rose-700">Order cancelled</p>
                            <p className="text-xs text-rose-600">Cancelled on {formatDate(order.cancelledAt)}</p>
                          </div>
                        )}
                        {order.isReturned && (
                          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                            <p className="text-sm font-semibold text-amber-700">Return requested</p>
                            <p className="text-xs text-amber-600">Requested on {formatDate(order.returnedAt)}</p>
                          </div>
                        )}
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center">
                            <FaCheckCircle className="text-emerald-500" />
                            <div className="w-px h-8 bg-emerald-200 mt-1"></div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">Order Confirmed</p>
                            <p className="text-xs text-slate-500">We have received your order.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center">
                            {order.isPaid ? (
                              <FaCheckCircle className="text-emerald-500" />
                            ) : (
                              <FaRegCircle className="text-amber-400" />
                            )}
                            <div className={`w-px h-8 mt-1 ${order.isPaid ? 'bg-emerald-200' : 'bg-slate-200'}`}></div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                              <FaCreditCard className="text-slate-400" /> Payment {order.isPaid ? 'Successful' : 'Pending'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {order.isPaid ? `Paid on ${order.paidAt?.substring(0, 10)}` : 'Awaiting payment confirmation.'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center">
                            {order.isDelivered ? (
                              <FaCheckCircle className="text-emerald-500" />
                            ) : order.isPaid ? (
                              <FaRegCircle className="text-amber-400" />
                            ) : (
                              <FaRegCircle className="text-slate-300" />
                            )}
                            <div className={`w-px h-8 mt-1 ${order.isDelivered ? 'bg-emerald-200' : order.isPaid ? 'bg-amber-200' : 'bg-slate-200'}`}></div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                              <FaTruck className="text-slate-400" /> {order.isDelivered ? 'Shipped' : 'Shipping'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {order.isCancelled ? 'Shipment stopped due to cancellation.' : order.isDelivered ? 'Handed to delivery partner.' : order.isPaid ? 'Preparing your shipment.' : 'Starts after payment.'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center">
                            {order.isDelivered ? (
                              <FaCheckCircle className="text-emerald-500" />
                            ) : (
                              <FaRegCircle className="text-slate-300" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                              <FaTruck className="text-slate-400" /> Delivery {order.isDelivered ? 'Complete' : 'In progress'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {order.isDelivered ? `Delivered on ${order.deliveredAt?.substring(0, 10)}` : 'Tracking will appear once shipped.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-6 rounded-2xl border border-white/80 bg-white/80 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-3">Tracking Details</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">Tracking ID</p>
                          <p className="font-semibold text-slate-900">{trackingId}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">Shipped Date</p>
                          <p className="font-semibold text-slate-900">{formatDate(shippedDate)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">ETA</p>
                          <p className="font-semibold text-slate-900">{formatDate(estimatedDelivery)}</p>
                        </div>
                      </div>
                    </div>
                    {userInfo && userInfo.isAdmin && (
                      <div className="mb-6 rounded-2xl border border-white/80 bg-white/80 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-3">Admin tracking tools</p>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={copyTrackingLink}
                            className="fs-button-ghost px-4 py-2 text-xs"
                          >
                            Copy link
                          </button>
                          <button
                            type="button"
                            onClick={whatsappShare}
                            className="fs-button-ghost px-4 py-2 text-xs text-emerald-600"
                          >
                            WhatsApp link
                          </button>
                          <button
                            type="button"
                            onClick={regenerateTrackingToken}
                            className="fs-button-ghost px-4 py-2 text-xs text-amber-600"
                          >
                            Regenerate link
                          </button>
                        </div>
                      </div>
                    )}
            <div className="space-y-3 border-b border-slate-100 pb-4 mb-4">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{order.itemsPrice}</span></div>
              <div className="flex justify-between text-slate-600"><span>Shipping</span><span>₹{order.shippingPrice}</span></div>
              <div className="flex justify-between text-slate-600"><span>Tax</span><span>₹{order.taxPrice}</span></div>
                        
                        {discount > 0 && (
                          <div className="flex justify-between text-green-600 font-bold">
                            <span>Coupon Discount ({discount}%)</span>
                            <span>-₹{(order.totalPrice * (discount / 100)).toFixed(2)}</span>
                          </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center text-xl font-semibold text-slate-900 mb-6">
                        <span>Total</span>
                        <span>₹{(order.totalPrice - (order.totalPrice * (discount / 100))).toFixed(2)}</span>
                    </div>

                    {order.isCancelled && (
                      <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
                        <p className="font-semibold">Refund status: {order.refundStatus}</p>
                        {order.refundAt && (
                          <p className="text-xs text-rose-600 mt-1">Refunded on {formatDate(order.refundAt)}</p>
                        )}
                      </div>
                    )}

                    {order.isReturned && (
                      <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-700">
                        <p className="font-semibold">Return status: {order.returnStatus}</p>
                        {order.returnRefundAt && (
                          <p className="text-xs text-amber-600 mt-1">Refunded on {formatDate(order.returnRefundAt)}</p>
                        )}
                      </div>
                    )}

                    {!order.isPaid && !order.isCancelled && (
                      <div className="mb-6 p-4 bg-white/70 rounded-2xl border border-dashed border-slate-200">
                        <div className="flex items-center gap-2 mb-2 text-slate-700 font-semibold text-xs uppercase">
                          <FaTicketAlt /> Have a Coupon?
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="FLIT10"
                            className="w-full p-2 border border-slate-200 rounded-full outline-none focus:ring-1 focus:ring-sky-500 uppercase font-mono text-sm"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                          />
                          <button onClick={applyCouponHandler} className="bg-slate-900 text-white px-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Apply</button>
                        </div>
                      </div>
                    )}

                    {isOwner && order.isPaid && !order.isDelivered && !order.isCancelled && (
                      <button
                        onClick={cancelOrderHandler}
                        className="w-full mb-4 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-4 rounded-full shadow-md transition-colors flex items-center justify-center gap-2"
                      >
                        Cancel Order
                      </button>
                    )}

                    {canReturn && (
                      <button
                        onClick={returnOrderHandler}
                        className="w-full mb-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-full shadow-md transition-colors flex items-center justify-center gap-2"
                      >
                        Request Return
                      </button>
                    )}

                    <button 
                        onClick={trackOnWhatsApp}
                        className="w-full mb-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-full shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                        <FaWhatsapp className="text-xl" />
                        <span>Track on WhatsApp</span>
                    </button>

                    {/* 🟢 FIXED INVOICE BUTTON: Opens the downloadInvoice function */}
                    {order.isPaid && (
                      <button 
                        onClick={downloadInvoice}
                        className="w-full mb-4 bg-white/80 hover:bg-white text-slate-800 font-semibold py-3 px-4 rounded-full border border-white/80 transition flex items-center justify-center gap-2"
                      >
                        <FaFilePdf className="text-red-600 text-xl" />
                        <span>Download Invoice</span>
                      </button>
                    )}

                    {!order.isPaid && !order.isCancelled ? (
                        <div className="mt-4 space-y-3">
                              <button onClick={handleRazorpayPayment} className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-full shadow-md transition-colors flex items-center justify-center gap-2">
                                <span>Pay with Razorpay</span>
                             </button>
                             {paypalClientId && (
                                <PayPalScriptProvider options={{ "client-id": paypalClientId }}>
                                    <PayPalButtons 
                                      createOrder={(data, actions) => actions.order.create({ 
                                        purchase_units: [{ amount: { value: (order.totalPrice - (order.totalPrice * (discount / 100))).toFixed(2) } }] 
                                      })} 
                                      onApprove={(data, actions) => actions.order.capture().then(async (details) => { window.location.reload(); })} 
                                    />
                                </PayPalScriptProvider>
                            )}
                        </div>
                    ) : (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                          <p className="text-emerald-700 font-semibold">Payment Successful</p>
                        </div>
                    )}

                   {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && !order.isCancelled && (
                    <button
                      type="button"
                      className="w-full bg-slate-900 text-white font-semibold py-3 rounded-full hover:bg-black transition mt-4"
                      onClick={deliverHandler}
                    >
                        {loadingDeliver ? 'Updating...' : 'Mark As Delivered'}
                    </button>
                    )}

                   {userInfo && userInfo.isAdmin && order.isCancelled && order.refundStatus === 'pending' && (
                    <button
                      type="button"
                      className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-full hover:bg-emerald-700 transition mt-4"
                      onClick={markRefundHandler}
                    >
                      Mark Refund Processed
                    </button>
                   )}

                   {userInfo && userInfo.isAdmin && order.isReturned && order.returnStatus === 'pending' && (
                    <button
                      type="button"
                      className="w-full bg-amber-600 text-white font-semibold py-3 rounded-full hover:bg-amber-700 transition mt-4"
                      onClick={markReturnRefundHandler}
                    >
                      Mark Return Refund Processed
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