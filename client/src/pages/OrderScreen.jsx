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
import { FaWhatsapp, FaTicketAlt, FaFilePdf } from 'react-icons/fa'; 

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

  const getPriceBreakdown = (orderData) => {
    if (!orderData) {
      return {
        actualItemsPrice: 0,
        taxableValue: 0,
        haggleSavings: 0,
        gstAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        shippingAmount: 0,
        couponPercent: 0,
        couponDiscountAmount: 0,
        finalPayable: 0,
      };
    }

    const actualItemsPrice = orderData.orderItems.reduce(
      (acc, item) => acc + Number(item.originalPrice || item.price) * Number(item.qty),
      0
    );
    const taxableValue = Number(orderData.itemsPrice || 0);
    const haggleSavings = Math.max(actualItemsPrice - taxableValue, 0);
    const gstAmount = Number(orderData.taxPrice || 0);
    const cgstAmount = gstAmount / 2;
    const sgstAmount = gstAmount / 2;
    const shippingAmount = Number(orderData.shippingPrice || 0);
    const couponPercent = Number(orderData.discount || discount || 0);
    const couponDiscountAmount = Number(((orderData.totalPrice || 0) * (couponPercent / 100)).toFixed(2));
    const finalPayable = Number(((orderData.totalPrice || 0) - couponDiscountAmount).toFixed(2));

    return {
      actualItemsPrice,
      taxableValue,
      haggleSavings,
      gstAmount,
      cgstAmount,
      sgstAmount,
      shippingAmount,
      couponPercent,
      couponDiscountAmount,
      finalPayable,
    };
  };

  // 🟢 FIXED INVOICE LOGIC
  const downloadInvoice = () => {
    const doc = new jsPDF();
    const breakdown = getPriceBreakdown(order);

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
    const tableColumn = ["Product", "Size", "Qty", "Original", "Deal", "Line Total"];
    const tableRows = order.orderItems.map(item => [
      item.name,
      item.size || '-',
      item.qty,
      `INR ${Number(item.originalPrice || item.price).toFixed(2)}`,
      `INR ${Number(item.price).toFixed(2)}`,
      `INR ${(item.qty * item.price).toFixed(2)}`
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
    doc.text(`Actual Item Price: INR ${breakdown.actualItemsPrice.toFixed(2)}`, 124, finalY);
    doc.text(`Haggle Savings: INR ${breakdown.haggleSavings.toFixed(2)}`, 124, finalY + 6);
    doc.text(`Taxable Value: INR ${breakdown.taxableValue.toFixed(2)}`, 124, finalY + 12);
    doc.text(`CGST (9%): INR ${breakdown.cgstAmount.toFixed(2)}`, 124, finalY + 18);
    doc.text(`SGST (9%): INR ${breakdown.sgstAmount.toFixed(2)}`, 124, finalY + 24);
    doc.text(`Shipping: INR ${breakdown.shippingAmount.toFixed(2)}`, 124, finalY + 30);
    
    if (breakdown.couponPercent > 0) {
      doc.setTextColor(34, 197, 94);
      doc.text(`Coupon (${breakdown.couponPercent}%): -INR ${breakdown.couponDiscountAmount.toFixed(2)}`, 124, finalY + 36);
    }

    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.text(`Final Payable: INR ${breakdown.finalPayable.toFixed(2)}`, 124, finalY + 46);

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
          } catch (error) {
            console.warn('PayPal config load failed', error);
          }

          try {
            const resRazorpay = await fetch('/api/config/razorpay');
            const razorpayData = await resRazorpay.json();
            setRazorpayKeyId(razorpayData.key);
          } catch (error) {
            console.warn('Razorpay config load failed', error);
          }
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

  if (loading) return <div className="text-center mt-20 text-muted">Loading...</div>;
  if (!order) return <div className="text-center mt-20 text-red-500">Order Not Found</div>;

  const breakdown = getPriceBreakdown(order);

  const openReviewSection = (productId) => {
    window.open(`/product/${productId}?reviewOnly=1#reviews-section`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-app min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
                <h1 className="text-3xl font-extrabold text-foreground">Order #{order._id.substring(0, 10)}...</h1>
                <p className="text-muted text-sm mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div className={`mt-4 md:mt-0 px-4 py-2 rounded-full font-bold text-sm ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {order.isPaid ? 'Payment Complete' : 'Payment Pending'}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="app-card p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Items in Your Order</h2>
                  <div className="divide-y divide-[color:var(--border)]">
                        {order.orderItems.map((item, index) => (
                            <div key={index} className="flex py-4">
                        <img src={item.image} alt={item.name} className="h-20 w-20 object-cover rounded-md border border-app" />
                                <div className="ml-4 flex-1">
                          <Link to={`/product/${item.product}`} className="text-primary font-medium hover:underline">
                                        {item.name}
                                    </Link>
                          {item.size && <p className="text-xs uppercase tracking-[0.18em] text-amber-700 font-black mt-1">Size: {item.size}</p>}
                          <p className="text-muted text-sm mt-1">Quantity: {item.qty}</p>
                          {item.isHaggled ? (
                            <div className="mt-1">
                              <p className="text-xs text-muted line-through">Original: ₹{Number(item.originalPrice || item.price).toFixed(2)}</p>
                              <p className="text-accent-1 font-bold">Deal Price: ₹{Number(item.price).toFixed(2)}</p>
                            </div>
                          ) : (
                            <p className="text-foreground font-bold mt-1">₹{Number(item.price).toFixed(2)}</p>
                          )}
                          {order.isPaid ? (
                            <button
                              type="button"
                              onClick={() => openReviewSection(item.product)}
                              className="inline-block mt-3 text-xs font-black uppercase tracking-wide text-primary hover:underline"
                            >
                              Write / View Review
                            </button>
                          ) : (
                            <p className="mt-3 text-xs text-muted">
                              Review available after payment
                            </p>
                          )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="app-card p-6">
                     <h2 className="text-lg font-semibold text-foreground mb-4">Shipping Details</h2>
                     <div className="text-muted text-sm space-y-1">
                        <p><span className="font-medium text-foreground">Recipient:</span> {order.user.name}</p>
                        <p><span className="font-medium text-foreground">Email:</span> {order.user.email}</p>
                        <p><span className="font-medium text-foreground">Address:</span> {order.shippingAddress.address}, {order.shippingAddress.city} - {order.shippingAddress.postalCode}</p>
                     </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="app-card p-6 h-fit">
                    <h2 className="text-xl font-bold text-foreground mb-6">Payment Summary</h2>
                    <div className="space-y-3 border-b border-app pb-4 mb-4">
                        <div className="flex justify-between text-muted"><span>Actual Item Price</span><span>₹{breakdown.actualItemsPrice.toFixed(2)}</span></div>
                        <div className="flex justify-between text-accent-1"><span>Haggle Savings</span><span>-₹{breakdown.haggleSavings.toFixed(2)}</span></div>
                        <div className="flex justify-between text-muted"><span>Taxable Value</span><span>₹{breakdown.taxableValue.toFixed(2)}</span></div>
                        <div className="flex justify-between text-muted"><span>CGST (9%)</span><span>₹{breakdown.cgstAmount.toFixed(2)}</span></div>
                        <div className="flex justify-between text-muted"><span>SGST (9%)</span><span>₹{breakdown.sgstAmount.toFixed(2)}</span></div>
                        <div className="flex justify-between text-muted"><span>Shipping</span><span>₹{breakdown.shippingAmount.toFixed(2)}</span></div>
                        
                        {breakdown.couponPercent > 0 && (
                          <div className="flex justify-between text-green-600 font-bold">
                            <span>Coupon Discount ({breakdown.couponPercent}%)</span>
                            <span>-₹{breakdown.couponDiscountAmount.toFixed(2)}</span>
                          </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center text-xl font-bold text-foreground mb-6">
                        <span>Final Payable</span>
                        <span>₹{breakdown.finalPayable.toFixed(2)}</span>
                    </div>

                    {!order.isPaid && (
                      <div className="mb-6 p-4 bg-surface-2 rounded-xl border border-dashed border-app">
                        <div className="flex items-center gap-2 mb-2 text-muted font-bold text-xs uppercase">
                          <FaTicketAlt /> Have a Coupon?
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="FLIT10"
                            className="app-input w-full uppercase font-mono text-sm"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                          />
                          <button onClick={applyCouponHandler} className="app-btn text-[10px] uppercase tracking-widest">Apply</button>
                        </div>
                      </div>
                    )}

                    <button 
                        onClick={trackOnWhatsApp}
                        className="w-full mb-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                        <FaWhatsapp className="text-xl" />
                        <span>Track on WhatsApp</span>
                    </button>

                    {/* 🟢 FIXED INVOICE BUTTON: Opens the downloadInvoice function */}
                    {order.isPaid && (
                      <button 
                        onClick={downloadInvoice}
                        className="w-full mb-4 bg-surface-2 hover:bg-surface text-foreground font-bold py-3 px-4 rounded-lg border border-app transition flex items-center justify-center gap-2"
                      >
                        <FaFilePdf className="text-red-600 text-xl" />
                        <span>Download Invoice</span>
                      </button>
                    )}

                    {!order.isPaid ? (
                        <div className="mt-4 space-y-3">
                              <button onClick={handleRazorpayPayment} className="w-full app-btn py-3 flex items-center justify-center gap-2">
                                <span>Pay with Razorpay</span>
                             </button>
                             {paypalClientId && (
                                <PayPalScriptProvider options={{ "client-id": paypalClientId }}>
                                    <PayPalButtons 
                                      createOrder={(data, actions) => actions.order.create({ 
                                        purchase_units: [{ amount: { value: (order.totalPrice - (order.totalPrice * (discount / 100))).toFixed(2) } }] 
                                      })} 
                                      onApprove={(data, actions) => actions.order.capture().then(async () => { window.location.reload(); })} 
                                    />
                                </PayPalScriptProvider>
                            )}
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                          <p className="text-green-700 font-medium">Payment Successful</p>
                        </div>
                    )}

                   {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                    <button
                        type="button"
                        className="w-full bg-foreground text-white font-bold py-3 rounded-lg hover:opacity-90 transition mt-4"
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