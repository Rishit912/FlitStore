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
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [addressLabel, setAddressLabel] = useState('Home');
  const [addressLine, setAddressLine] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressPostal, setAddressPostal] = useState('');
  const [addressCountry, setAddressCountry] = useState('');
  const [addressPhone, setAddressPhone] = useState('');
  const [addressDefault, setAddressDefault] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
      fetchMyOrders(); // 🟢 Fetch history when component loads
      fetchAddresses();
      fetchNotifications();
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

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get('/api/users/addresses');
      setAddresses(data || []);
      setLoadingAddresses(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load addresses');
      setLoadingAddresses(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get('/api/users/notifications');
      setNotifications(data || []);
      setLoadingNotifications(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load notifications');
      setLoadingNotifications(false);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      const { data } = await axios.put(`/api/users/notifications/${id}/read`);
      setNotifications(data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to mark as read');
    }
  };

  const clearNotifications = async () => {
    try {
      const { data } = await axios.delete('/api/users/notifications');
      setNotifications(data || []);
      toast.info('Notifications cleared');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to clear notifications');
    }
  };

  const addAddressHandler = async (e) => {
    e.preventDefault();

    if (!addressLine || !addressCity || !addressPostal || !addressCountry) {
      toast.error('Please fill in all address fields');
      return;
    }

    try {
      const payload = {
        label: addressLabel,
        address: addressLine,
        city: addressCity,
        postalCode: addressPostal,
        country: addressCountry,
        phone: addressPhone,
        isDefault: addressDefault,
      };

      const { data } = await axios.post('/api/users/addresses', payload);
      setAddresses(data || []);
      setAddressLabel('Home');
      setAddressLine('');
      setAddressCity('');
      setAddressPostal('');
      setAddressCountry('');
      setAddressPhone('');
      setAddressDefault(false);
      toast.success('Address saved');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save address');
    }
  };

  const setDefaultAddress = async (id) => {
    try {
      const { data } = await axios.put(`/api/users/addresses/${id}`, { isDefault: true });
      setAddresses(data || []);
      toast.success('Default address updated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update default address');
    }
  };

  const deleteAddressHandler = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      const { data } = await axios.delete(`/api/users/addresses/${id}`);
      setAddresses(data || []);
      toast.info('Address removed');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to remove address');
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
    <div className="fs-container fs-section flex flex-col lg:flex-row gap-10">
      
      {/* LEFT: UPDATE PROFILE FORM */}
      <div className="lg:w-1/3 fs-card p-6 h-fit">
        <h1 className="text-2xl font-black mb-6 text-slate-900 uppercase tracking-tight">User Profile</h1>
        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-[0.2em] mb-1">Full Name</label>
            <input
              type="text"
              className="fs-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-[0.2em] mb-1">Email Address</label>
            <input
              type="email"
              className="fs-input bg-slate-50 text-slate-500 cursor-not-allowed"
              value={email}
              disabled 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-[0.2em] mb-1">New Password</label>
            <input
              type="password"
              className="fs-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-[0.2em] mb-1">Confirm Password</label>
            <input
              type="password"
              className="fs-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="w-full fs-button-primary py-4 text-xs uppercase tracking-[0.2em]"
          >
            Update Account
          </button>
        </form>
      </div>

      {/* RIGHT: ADDRESS BOOK + ORDER HISTORY */}
      <div className="lg:w-2/3 space-y-10">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Notifications</h2>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearNotifications}
                className="fs-button-ghost px-3 py-2 text-xs"
              >
                Clear all
              </button>
            )}
          </div>

          {loadingNotifications ? (
            <div className="fs-card p-6 text-slate-400">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="fs-card p-6 text-slate-400">No notifications yet.</div>
          ) : (
            <div className="space-y-3">
              {notifications.map((note) => (
                <div key={note._id} className="fs-card p-4 flex items-start justify-between gap-4">
                  <div>
                    <p className={`text-sm font-semibold ${note.isRead ? 'text-slate-500' : 'text-slate-900'}`}>
                      {note.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{note.createdAt?.substring(0, 10)}</p>
                  </div>
                  {!note.isRead && (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(note._id)}
                      className="fs-button-ghost px-3 py-2 text-xs"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-black mb-6 text-slate-900 uppercase tracking-tight">Saved Addresses</h2>

          <div className="fs-card p-6 mb-6">
            <form onSubmit={addAddressHandler} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  className="fs-input"
                  placeholder="Label (Home, Work)"
                  value={addressLabel}
                  onChange={(e) => setAddressLabel(e.target.value)}
                />
                <input
                  type="text"
                  className="fs-input"
                  placeholder="Phone (optional)"
                  value={addressPhone}
                  onChange={(e) => setAddressPhone(e.target.value)}
                />
              </div>
              <input
                type="text"
                className="fs-input"
                placeholder="Address"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  className="fs-input"
                  placeholder="City"
                  value={addressCity}
                  onChange={(e) => setAddressCity(e.target.value)}
                  required
                />
                <input
                  type="text"
                  className="fs-input"
                  placeholder="Postal Code"
                  value={addressPostal}
                  onChange={(e) => setAddressPostal(e.target.value)}
                  required
                />
                <input
                  type="text"
                  className="fs-input"
                  placeholder="Country"
                  value={addressCountry}
                  onChange={(e) => setAddressCountry(e.target.value)}
                  required
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={addressDefault}
                  onChange={(e) => setAddressDefault(e.target.checked)}
                />
                Set as default
              </label>
              <button type="submit" className="fs-button-primary px-6 py-3 text-xs uppercase tracking-[0.2em]">
                Save Address
              </button>
            </form>
          </div>

          {loadingAddresses ? (
            <div className="fs-card p-6 text-slate-400">Loading addresses...</div>
          ) : addresses.length === 0 ? (
            <div className="fs-card p-6 text-slate-400">No saved addresses yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((item) => (
                <div key={item._id} className="fs-card p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{item.label || 'Address'}</p>
                    {item.isDefault && (
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">Default</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{item.address}</p>
                  <p className="text-sm text-slate-600">{item.city} - {item.postalCode}</p>
                  <p className="text-sm text-slate-600">{item.country}</p>
                  {item.phone && <p className="text-xs text-slate-500 mt-1">{item.phone}</p>}
                  <div className="flex gap-2 mt-4">
                    {!item.isDefault && (
                      <button
                        type="button"
                        onClick={() => setDefaultAddress(item._id)}
                        className="fs-button-ghost px-3 py-2 text-xs"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteAddressHandler(item._id)}
                      className="fs-button-ghost px-3 py-2 text-xs text-rose-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-black mb-6 text-slate-900 uppercase tracking-tight">Past Orders & Payments</h2>
        
        {loadingOrders ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="fs-card p-10 text-center border-2 border-dashed border-white/80">
             <p className="text-slate-400 font-semibold uppercase tracking-[0.2em]">No history found</p>
             <Link to="/" className="text-sky-700 text-sm font-semibold hover:underline">Start Shopping</Link>
          </div>
        ) : (
          <div className="overflow-hidden fs-card">
            <table className="w-full text-left">
              <thead className="bg-white/80 text-[10px] font-semibold uppercase text-slate-400 tracking-[0.2em]">
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
                  <tr key={order._id} className="hover:bg-sky-50/30 transition">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{order._id.substring(0, 10)}...</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{order.createdAt.substring(0, 10)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">₹{order.totalPrice}</td>
                    <td className="px-6 py-4">
                      {order.isPaid ? (
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-tight">
                          {order.paidAt.substring(0, 10)}
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-tight">Not Paid</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {order.isDelivered ? (
                        <span className="text-sky-600 text-xs font-semibold uppercase">Delivered</span>
                      ) : (
                        <span className="text-slate-400 text-xs font-semibold uppercase italic">Processing</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/order/${order._id}`} className="bg-white/80 text-slate-900 px-4 py-2 rounded-full text-xs font-semibold border border-white/70 hover:bg-white transition">
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
    </div>
  );
};

export default ProfileScreen;