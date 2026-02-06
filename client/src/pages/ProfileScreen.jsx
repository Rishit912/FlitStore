import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { setCredentials } from '../slices/authSlice';
import { Link } from 'react-router-dom';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
      fetchMyOrders(); // 🟢 Fetch history when component loads
    }
  }, [userInfo]);

  const fetchMyOrders = async () => {
    try {
      // 🟢 Calls the getMyOrders controller we updated in the backend
      const { data } = await axios.get('/api/orders/myorders');
      setOrders(data);
      setLoadingOrders(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load orders');
      setLoadingOrders(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const updateData = { name, email };
      if (password) updateData.password = password;

      const res = await axios.put('/api/users/profile', updateData);
      dispatch(setCredentials({ ...res.data }));
      toast.success('Profile updated successfully');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err?.response?.data?.message || err.error || 'Update failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4 flex flex-col lg:flex-row gap-10">
      
      {/* LEFT: UPDATE PROFILE FORM */}
      <div className="lg:w-1/3 bg-white p-6 shadow-xl rounded-2xl border border-gray-100 h-fit">
        <h1 className="text-2xl font-black mb-6 text-gray-800 uppercase tracking-tighter">User Profile</h1>
        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</label>
            <input
              type="email"
              className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
              value={email}
              disabled 
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">New Password</label>
            <input
              type="password"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Confirm Password</label>
            <input
              type="password"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg active:scale-95"
          >
            Update Account
          </button>
        </form>
      </div>

      {/* RIGHT: ORDER & PAYMENT HISTORY */}
      <div className="lg:w-2/3">
        <h2 className="text-2xl font-black mb-6 text-gray-800 uppercase tracking-tighter">Past Orders & Payments</h2>
        
        {loadingOrders ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-gray-50 p-10 rounded-2xl text-center border-2 border-dashed border-gray-200">
             <p className="text-gray-400 font-bold uppercase tracking-widest">No history found</p>
             <Link to="/" className="text-blue-600 text-sm font-bold hover:underline">Start Shopping</Link>
          </div>
        ) : (
          <div className="overflow-hidden bg-white shadow-xl rounded-2xl border border-gray-100">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Paid</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-blue-50/30 transition">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">{order._id.substring(0, 10)}...</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.createdAt.substring(0, 10)}</td>
                    <td className="px-6 py-4 text-sm font-black text-gray-900">₹{order.totalPrice}</td>
                    <td className="px-6 py-4">
                      {order.isPaid ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                          {order.paidAt.substring(0, 10)}
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Not Paid</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {order.isDelivered ? (
                        <span className="text-blue-600 text-xs font-black uppercase">Delivered</span>
                      ) : (
                        <span className="text-gray-400 text-xs font-black uppercase italic">Processing</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/order/${order._id}`} className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg text-xs font-black hover:bg-gray-200 transition">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileScreen;