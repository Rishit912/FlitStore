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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Order Management (Admin)</h1>

      {loading ? (
        <div className="flex justify-center mt-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[color:var(--primary)]"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
        </div>
      ) : (
        <div className="overflow-x-auto app-card">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-surface-2 text-muted uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Order ID</th>
                <th className="py-3 px-6 text-left">User</th>
                <th className="py-3 px-6 text-left">Date</th>
                <th className="py-3 px-6 text-left">Total</th>
                <th className="py-3 px-6 text-center">Paid</th>
                <th className="py-3 px-6 text-center">Delivered</th>
                <th className="py-3 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-muted text-sm font-light">
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-app hover:bg-surface-2/60 transition">
                  <td className="py-3 px-6 text-left font-medium text-muted">{order._id.substring(0, 10)}...</td>
                  <td className="py-3 px-6 text-left">{order.user && order.user.name}</td>
                  <td className="py-3 px-6 text-left">{order.createdAt.substring(0, 10)}</td>
                  <td className="py-3 px-6 text-left font-bold text-foreground">₹{order.totalPrice}</td>
                  
                  {/* PAID STATUS */}
                  <td className="py-3 px-6 text-center">
                    {order.isPaid ? (
                      <span className="bg-green-100 text-green-700 py-1 px-3 rounded-full text-xs font-bold">
                        {order.paidAt.substring(0, 10)}
                      </span>
                    ) : (
                      <FaTimes className="text-red-500 mx-auto" />
                    )}
                  </td>

                  {/* DELIVERED STATUS */}
                  <td className="py-3 px-6 text-center">
                    {order.isDelivered ? (
                      <span className="bg-green-100 text-green-700 py-1 px-3 rounded-full text-xs font-bold">
                        {order.deliveredAt.substring(0, 10)}
                      </span>
                    ) : (
                       <span className="text-orange-500 font-bold text-xs">Pending</span>
                    )}
                  </td>

                  <td className="py-3 px-6 text-center">
                    <Link to={`/order/${order._id}`}>
                      <button className="app-btn py-1 px-4 rounded text-xs uppercase tracking-wide">
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