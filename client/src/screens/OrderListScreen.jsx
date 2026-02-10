import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { listOrders } from '../actions/orderActions';
import { FaTimes } from 'react-icons/fa'; // We only use FaTimes for now

const OrderListScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 1. Get Data from Redux
  const orderList = useSelector((state) => state.orderList);
  const { loading, error, orders } = orderList;

  // 2. Get User Info
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    // 🛑 TEMPORARY FIX:
    // We removed "&& userInfo.isAdmin" so you can see the page immediately.
    if (userInfo) {
      dispatch(listOrders());
    } else {
      navigate('/login');
    }
  }, [dispatch, navigate, userInfo]);

  return (
    <div className="fs-container fs-section">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black text-slate-900">Order Management (Admin)</h1>
        <span className="fs-pill">Overview</span>
      </div>

      {loading ? (
        <div className="flex justify-center mt-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
        </div>
      ) : (
        <div className="overflow-x-auto fs-card">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-white/80 text-slate-400 uppercase text-xs leading-normal tracking-[0.2em]">
                <th className="py-3 px-6 text-left">Order ID</th>
                <th className="py-3 px-6 text-left">User</th>
                <th className="py-3 px-6 text-left">Date</th>
                <th className="py-3 px-6 text-left">Total</th>
                <th className="py-3 px-6 text-center">Paid</th>
                <th className="py-3 px-6 text-center">Delivered</th>
                <th className="py-3 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 text-sm font-light">
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-slate-100 hover:bg-sky-50/40 transition">
                  <td className="py-3 px-6 text-left font-medium">{order._id.substring(0, 10)}...</td>
                  <td className="py-3 px-6 text-left">{order.user && order.user.name}</td>
                  <td className="py-3 px-6 text-left">{order.createdAt.substring(0, 10)}</td>
                  <td className="py-3 px-6 text-left font-semibold text-slate-800">₹{order.totalPrice}</td>
                  
                  {/* PAID STATUS */}
                  <td className="py-3 px-6 text-center">
                    {order.isPaid ? (
                        <span className="bg-emerald-100 text-emerald-700 py-1 px-3 rounded-full text-xs font-semibold">
                        {order.paidAt.substring(0, 10)}
                      </span>
                    ) : (
                      <FaTimes className="text-red-500 mx-auto" />
                    )}
                  </td>

                  {/* DELIVERED STATUS */}
                  <td className="py-3 px-6 text-center">
                    {order.isDelivered ? (
                        <span className="bg-emerald-100 text-emerald-700 py-1 px-3 rounded-full text-xs font-semibold">
                        {order.deliveredAt.substring(0, 10)}
                      </span>
                    ) : (
                       <span className="text-amber-500 font-semibold text-xs">Pending</span>
                    )}
                  </td>

                  <td className="py-3 px-6 text-center">
                    <Link to={`/order/${order._id}`}>
                      <button className="bg-slate-900 text-white py-1 px-4 rounded-full hover:bg-sky-600 transition shadow-sm text-xs uppercase tracking-wide">
                        Details
                      </button>
                    </Link>
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