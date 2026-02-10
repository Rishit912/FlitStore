import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaTimes, FaCheck } from 'react-icons/fa';
import { listOrders } from '../actions/orderActions';
import AdminChart from '../components/AdminChart'; // 🟢 Added Chart Component

const OrderListScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const orderList = useSelector((state) => state.orderList);
  const { loading, error, orders } = orderList;

  const { userInfo } = useSelector((state) => state.auth);

  const trackingLink = (token) => `${window.location.origin}/track/${token}`;

  const copyTrackingLink = async (token) => {
    try {
      await navigator.clipboard.writeText(trackingLink(token));
    } catch (error) {
      window.prompt('Copy tracking link:', trackingLink(token));
    }
  };

  const whatsappShare = (token) => {
    const link = trackingLink(token);
    const message = `Your FlitStore order tracking link: ${link}`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(listOrders());
    } else {
      navigate('/login');
    }
  }, [dispatch, navigate, userInfo]);

  // 🟢 LOGIC: Calculate Total Lifetime Revenue for the header
  const totalRevenue = orders 
    ? orders.reduce((acc, order) => acc + order.totalPrice, 0) 
    : 0;
  const cancelledOrders = orders ? orders.filter((order) => order.isCancelled).length : 0;
  const returnedOrders = orders ? orders.filter((order) => order.isReturned).length : 0;
  const refundPending = orders
    ? orders.filter((order) => order.refundStatus === 'pending' || order.returnStatus === 'pending').length
    : 0;

  return (
    <div className="fs-container fs-section">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                  Management <span className="text-sky-600">Console</span>
                </h1>
                <p className="text-slate-500 font-semibold text-xs uppercase tracking-[0.2em] mt-1">
                    Order Records & Financial Analytics
                </p>
            </div>
            {/* 🟢 Visual Revenue Badge */}
              <div className="mt-4 md:mt-0 fs-card p-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Total Revenue</p>
                <p className="text-2xl font-black text-sky-600">₹{totalRevenue.toLocaleString('en-IN')}</p>
            </div>
        </div>

        {loading ? (
          <p className="text-center py-10 font-bold text-gray-400 animate-pulse">Loading Dashboard Data...</p>
        ) : error ? (
          <p className="text-red-500 bg-red-50 p-4 rounded-xl font-bold">{error}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="fs-card p-5 rounded-2xl">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Cancelled</p>
                <p className="text-2xl font-black text-rose-600 mt-2">{cancelledOrders}</p>
                <p className="text-xs text-slate-500 mt-1">Orders cancelled by users</p>
              </div>
              <div className="fs-card p-5 rounded-2xl">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Returns</p>
                <p className="text-2xl font-black text-amber-600 mt-2">{returnedOrders}</p>
                <p className="text-xs text-slate-500 mt-1">Return requests received</p>
              </div>
              <div className="fs-card p-5 rounded-2xl">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Refund Pending</p>
                <p className="text-2xl font-black text-emerald-600 mt-2">{refundPending}</p>
                <p className="text-xs text-slate-500 mt-1">Awaiting refund processing</p>
              </div>
            </div>

            {/* 🟢 ANALYTICS SECTION */}
            <div className="mb-10 animate-fade-in">
              <AdminChart orders={orders} />
            </div>

            <div className="fs-card rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-gray-50">
                <h2 className="font-black uppercase text-sm tracking-[0.2em] text-slate-800">Recent Transactions</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-gray-400">
                    <tr>
                      <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest">Order ID</th>
                      <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest">Customer</th>
                      <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest">Date</th>
                      <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest">Total Price</th>
                      <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest">Payment</th>
                      <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest">Delivery</th>
                      <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest">Tracking</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders && orders.map((order) => (
                      <tr key={order._id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="p-4 text-xs font-bold text-gray-400 group-hover:text-blue-600">
                          {order._id.substring(0, 12)}...
                        </td>
                        <td className="p-4 text-sm font-black text-gray-800">
                          {order.user && order.user.name}
                        </td>
                        <td className="p-4 text-sm text-gray-500 font-medium">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-sm font-black text-blue-600">
                          ₹{order.totalPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4">
                          {order.isPaid ? (
                            <div className="flex flex-col">
                              <span className="flex items-center text-green-600 font-black text-[10px] uppercase">
                                <FaCheck className="mr-1" /> Paid
                              </span>
                              <span className="text-[9px] text-gray-400 font-bold">{order.paidAt.substring(0, 10)}</span>
                            </div>
                          ) : (
                            <span className="flex items-center text-red-400 font-black text-[10px] uppercase">
                              <FaTimes className="mr-1" /> Unpaid
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {order.isDelivered ? (
                            <div className="flex flex-col">
                              <span className="flex items-center text-blue-600 font-black text-[10px] uppercase">
                                <FaCheck className="mr-1" /> Shipped
                              </span>
                              <span className="text-[9px] text-gray-400 font-bold">{order.deliveredAt.substring(0, 10)}</span>
                            </div>
                          ) : (
                            <span className="bg-orange-50 text-orange-500 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-orange-100">
                              Processing
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {order.trackingToken ? (
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => copyTrackingLink(order.trackingToken)}
                                className="text-xs font-semibold text-sky-700 hover:underline"
                              >
                                Copy link
                              </button>
                              <button
                                onClick={() => whatsappShare(order.trackingToken)}
                                className="text-xs font-semibold text-emerald-600 hover:underline"
                              >
                                WhatsApp
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => navigate(`/order/${order._id}`)} 
                            className="bg-gray-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition transform active:scale-95"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderListScreen;