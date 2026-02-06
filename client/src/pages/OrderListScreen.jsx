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

  return (
    <div className="p-8 mt-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">
                    Management <span className="text-blue-600">Console</span>
                </h1>
                <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">
                    Order Records & Financial Analytics
                </p>
            </div>
            {/* 🟢 Visual Revenue Badge */}
            <div className="mt-4 md:mt-0 bg-white p-4 rounded-2xl shadow-sm border border-blue-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Revenue</p>
                <p className="text-2xl font-black text-blue-600">₹{totalRevenue.toLocaleString('en-IN')}</p>
            </div>
        </div>

        {loading ? (
          <p className="text-center py-10 font-bold text-gray-400 animate-pulse">Loading Dashboard Data...</p>
        ) : error ? (
          <p className="text-red-500 bg-red-50 p-4 rounded-xl font-bold">{error}</p>
        ) : (
          <>
            {/* 🟢 ANALYTICS SECTION */}
            <div className="mb-10 animate-fade-in">
              <AdminChart orders={orders} />
            </div>

            <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
              <div className="p-6 border-b border-gray-50">
                <h2 className="font-black uppercase text-sm tracking-widest text-gray-800">Recent Transactions</h2>
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