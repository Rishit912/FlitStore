import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { setCredentials } from '../slices/authSlice';
import { Link } from 'react-router-dom';
import { FaUserEdit, FaHistory, FaEye } from 'react-icons/fa';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRetailer, setIsRetailer] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
      setIsRetailer(!!userInfo.isRetailer);
      fetchMyOrders();
    }
  }, [userInfo]);

  const fetchMyOrders = async () => {
    try {
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
      const updateData = { name, email, isRetailer };
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
    <div className="max-w-7xl mx-auto mt-20 px-4 py-10 flex flex-col lg:flex-row gap-10">
      
      {/* LEFT: UPDATE PROFILE FORM */}
      <div className="lg:w-1/3 bg-surface p-8 rounded-[2rem] shadow-xl border border-app h-fit">
        <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg"><FaUserEdit /></div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">My Account</h1>
        </div>
        <form onSubmit={submitHandler} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-1">Full Name</label>
            <input type="text" className="w-full p-4 bg-surface-2 border border-transparent rounded-2xl focus:bg-surface focus:border-primary outline-none transition-all font-bold" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-1">Email (Locked)</label>
            <input type="email" className="w-full p-4 bg-surface-2 border border-transparent rounded-2xl text-muted cursor-not-allowed font-bold" value={email} disabled />
          </div>

          <div>
            <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-1">New Password</label>
            <input type="password" placeholder="Leave blank to keep same" className="w-full p-4 bg-surface-2 border border-transparent rounded-2xl focus:bg-surface focus:border-primary outline-none transition-all font-bold" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div>
            <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-1">Confirm Password</label>
            <input type="password" className="w-full p-4 bg-surface-2 border border-transparent rounded-2xl focus:bg-surface focus:border-primary outline-none transition-all font-bold" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>

          <button type="submit" className="app-btn w-full py-4">
            Save Changes
          </button>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isRetailer"
              checked={isRetailer}
              onChange={e => setIsRetailer(e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />
            <label htmlFor="isRetailer" className="text-sm font-bold text-foreground select-none">
              I want to become a Retailer (Sell on FlitStore)
            </label>
          </div>
        </form>
      </div>

      {/* RIGHT: ORDER HISTORY */}
      <div className="lg:w-2/3">
        <div className="flex items-center gap-3 mb-6">
            <div className="bg-surface-2 p-3 rounded-2xl text-foreground"><FaHistory /></div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">Purchase History</h2>
        </div>
        
        {loadingOrders ? (
          <div className="flex justify-center py-20 animate-pulse font-bold text-muted uppercase tracking-widest">Loading Records...</div>
        ) : orders.length === 0 ? (
          <div className="bg-surface-2 p-20 rounded-[2.5rem] text-center border-2 border-dashed border-app">
              <p className="text-muted font-bold uppercase tracking-widest mb-4">You haven't placed any orders yet</p>
              <Link to="/" className="app-btn px-8 py-3 text-xs">Start Shopping</Link>
          </div>
        ) : (
          <div className="overflow-hidden bg-surface rounded-[2.5rem] shadow-xl border border-app">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-2 text-[10px] font-black uppercase text-muted tracking-widest">
                  <th className="px-8 py-5">Order ID</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Total</th>
                  <th className="px-8 py-5">Payment</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-surface-2/50 transition-colors group">
                    <td className="px-8 py-6 font-mono text-xs text-muted">{order._id.substring(0, 8)}...</td>
                    <td className="px-8 py-6 text-sm font-medium text-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-8 py-6 text-sm font-black text-foreground">₹{order.totalPrice.toLocaleString()}</td>
                    <td className="px-8 py-6">
                      {order.isPaid ? (
                        <span className="text-green-600 font-black text-[10px] uppercase tracking-tighter flex items-center gap-1">
                          <div className="w-1 h-1 bg-green-600 rounded-full"></div> Verified
                        </span>
                      ) : (
                        <span className="text-red-400 font-black text-[10px] uppercase tracking-tighter flex items-center gap-1">
                           <div className="w-1 h-1 bg-red-400 rounded-full"></div> Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      {order.isDelivered ? (
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">Arrived</span>
                      ) : (
                        <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">In Transit</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Link to={`/order/${order._id}`} className="inline-flex items-center gap-2 text-xs font-black uppercase text-blue-600 hover:text-blue-800 transition">
                        View Details <FaEye />
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