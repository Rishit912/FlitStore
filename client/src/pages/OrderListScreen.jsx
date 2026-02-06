import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaTimes, FaCheck } from 'react-icons/fa';
import { listOrders } from '../actions/orderActions';

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

  return (
    <div className="p-8 mt-16">
      <h1 className="text-2xl font-black mb-6 uppercase tracking-tight">
        Order <span className="text-blue-600">Records</span>
      </h1>
      {loading ? (
        <p className="text-center py-10 font-bold text-gray-400 animate-pulse">Loading Orders...</p>
      ) : error ? (
        <p className="text-red-500 bg-red-50 p-4 rounded-xl font-bold">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow-xl rounded-2xl overflow-hidden">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">ID</th>
                <th className="p-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">USER</th>
                <th className="p-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">DATE</th>
                <th className="p-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">TOTAL</th>
                <th className="p-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">PAID</th>
                <th className="p-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">DELIVERED</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {/* Added safety check (orders &&) to prevent crashes */}
              {orders && orders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 text-sm font-bold text-gray-400">{order._id}</td>
                  <td className="p-4 text-sm font-black text-gray-800">{order.user && order.user.name}</td>
                  <td className="p-4 text-sm text-gray-500">{order.createdAt.substring(0, 10)}</td>
                  <td className="p-4 text-sm font-black text-blue-600">₹{order.totalPrice.toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    {order.isPaid ? (
                      <span className="flex items-center text-green-600 font-bold text-xs uppercase">
                        <FaCheck className="mr-1" /> {order.paidAt.substring(0, 10)}
                      </span>
                    ) : (
                      <FaTimes className="text-red-500" />
                    )}
                  </td>
                  <td className="p-4">
                    {order.isDelivered ? (
                      <span className="flex items-center text-green-600 font-bold text-xs uppercase">
                        <FaCheck className="mr-1" /> {order.deliveredAt.substring(0, 10)}
                      </span>
                    ) : (
                      <span className="bg-red-50 text-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">Pending</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => navigate(`/order/${order._id}`)} 
                      className="bg-black text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition shadow-lg"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderListScreen;