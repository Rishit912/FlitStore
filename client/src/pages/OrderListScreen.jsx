import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { FaTimes, FaCheck, FaChartPie } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { listOrders } from '../actions/orderActions';
import AdminChart from '../components/AdminChart';
import AdminSummary from '../components/AdminSummary';
import NegotiationChart from '../pages/NegotiationChart'; // 🟢 Added

const OrderListScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [summary, setSummary] = useState({});
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState('');

  const orderList = useSelector((state) => state.orderList);
  const { loading, error, orders } = orderList;

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(listOrders());
      fetchSummary(); // 🟢 Fetch the financial data
    } else {
      navigate('/login');
    }
  }, [dispatch, navigate, userInfo]);

  const fetchSummary = async () => {
    try {
      const { data } = await axios.get('/api/orders/summary');
      setSummary(data);
      setLoadingSummary(false);
    } catch (err) {
      setLoadingSummary(false);
    }
  };

  const getOrderFulfillmentStatus = (order) => {
    const statuses = (order.orderItems || []).map((item) => item.fulfillmentStatus || 'pending');
    if (statuses.length === 0) return 'pending';
    if (statuses.every((status) => status === 'delivered')) return 'delivered';
    if (statuses.some((status) => status === 'out_for_delivery')) return 'out_for_delivery';
    if (statuses.some((status) => status === 'shipped')) return 'shipped';
    if (statuses.some((status) => status === 'packed')) return 'packed';
    return 'pending';
  };

  const updateFulfillmentAsAdmin = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      await axios.put(`/api/orders/${orderId}/fulfillment`, { status });
      dispatch(listOrders());
      toast.success(`Fulfillment updated: ${status.replaceAll('_', ' ')}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to update fulfillment');
    } finally {
      setUpdatingOrderId('');
    }
  };

  return (
    <div className="p-8 mt-16 bg-app min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
            <div>
                <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">
                    Command <span className="text-primary">Center</span>
                </h1>
                <p className="text-muted font-bold text-[10px] uppercase tracking-widest mt-1 italic">
                  FlitStore Real-time Business Intelligence
                </p>
            </div>
        </div>

        {/* 🟢 TOP ROW: SUMMARY CARDS */}
        {!loadingSummary && <AdminSummary stats={summary} />}

        {loading ? (
          <p className="text-center py-10 font-black text-muted animate-pulse uppercase tracking-widest">Synthesizing Data...</p>
        ) : error ? (
          <p className="text-red-500 bg-red-50 p-6 rounded-[2rem] font-bold border border-red-100">{error}</p>
        ) : (
          <>
            {/* 🟢 ANALYTICS GRID: Line Chart + Bargain Doughnut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              <div className="lg:col-span-2">
                 <AdminChart orders={orders} />
              </div>
              <div className="h-full">
                 {!loadingSummary && (
                   <NegotiationChart 
                     sales={Number(summary.totalSales)} 
                     loss={Number(summary.negotiationLoss)} 
                   />
                 )}
              </div>
            </div>

            <div className="bg-surface rounded-[2.5rem] shadow-xl border border-app overflow-hidden">
              <div className="p-8 border-b border-app flex justify-between items-center">
                <h2 className="font-black uppercase text-sm tracking-widest text-foreground">Live Transaction Stream</h2>
                <div className="bg-surface-2 text-foreground px-4 py-1 rounded-full text-[10px] font-black uppercase border border-app">
                   {orders ? orders.length : 0} Total Orders
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-2 text-muted">
                    <tr>
                      <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest">Transaction ID</th>
                      <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest">Client</th>
                      <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest">Date</th>
                      <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest">Revenue</th>
                      <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest">Financials</th>
                      <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest">Logistics</th>
                      <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest">Fulfillment Control</th>
                      <th className="p-6"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app">
                    {orders && orders.map((order) => (
                      <tr key={order._id} className="hover:bg-surface-2/50 transition-colors group">
                        <td className="p-6 text-[10px] font-mono font-bold text-muted">
                          #{order._id.substring(0, 12)}
                        </td>
                        <td className="p-6 text-sm font-black text-foreground uppercase tracking-tighter">
                          {order.user && order.user.name}
                        </td>
                        <td className="p-6 text-xs text-muted font-bold uppercase">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="p-6 text-sm font-black text-primary">
                          ₹{order.totalPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="p-6">
                          {order.isPaid ? (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[9px] font-black uppercase">Settled</span>
                          ) : (
                            <span className="bg-red-50 text-red-400 px-3 py-1 rounded-full text-[9px] font-black uppercase">Pending</span>
                          )}
                        </td>
                        <td className="p-6">
                          {getOrderFulfillmentStatus(order) === 'delivered' ? (
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase">Delivered</span>
                          ) : getOrderFulfillmentStatus(order) === 'out_for_delivery' ? (
                            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[9px] font-black uppercase">Out for Delivery</span>
                          ) : getOrderFulfillmentStatus(order) === 'shipped' ? (
                            <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-[9px] font-black uppercase">Shipped</span>
                          ) : getOrderFulfillmentStatus(order) === 'packed' ? (
                            <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-[9px] font-black uppercase">Packed</span>
                          ) : (
                            <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">Processing</span>
                          )}
                        </td>
                        <td className="p-6">
                          <select
                            className="app-input text-xs py-2"
                            value={getOrderFulfillmentStatus(order)}
                            disabled={updatingOrderId === order._id || !order.isPaid}
                            onChange={(e) => updateFulfillmentAsAdmin(order._id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="packed">Packed</option>
                            <option value="shipped">Shipped</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </td>
                        <td className="p-6 text-right">
                          <button 
                            onClick={() => navigate(`/order/${order._id}`)} 
                            className="app-btn text-[10px] px-6 py-2"
                          >
                            Analyze
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