import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTrash, FaPlus, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const CouponListScreen = () => {
  const [coupons, setCoupons] = useState([]);
  const [name, setName] = useState('');
  const [discount, setDiscount] = useState('');
  const [expiry, setExpiry] = useState('');

  const fetchCoupons = async () => {
    const { data } = await axios.get('/api/coupons');
    setCoupons(data);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/coupons', { name, discount, expiry });
      toast.success('Coupon Created!');
      setName(''); setDiscount(''); setExpiry('');
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || err.error);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure?')) {
      await axios.delete(`/api/coupons/${id}`);
      fetchCoupons();
    }
  };

  const toggleActiveHandler = async (coupon) => {
    try {
      const { data } = await axios.patch(`/api/coupons/${coupon._id}/active`, {
        isActive: !coupon.isActive,
      });
      toast.success(`${data.name} is now ${data.isActive ? 'active' : 'inactive'}`);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to update coupon status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-black uppercase mb-6 text-foreground">Coupon Management</h1>
      
      {/* Create Form */}
      <form onSubmit={submitHandler} className="app-card p-6 mb-10 flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-[10px] font-black uppercase text-muted">Code</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full app-input" placeholder="FLIT10" required />
        </div>
        <div className="w-32">
          <label className="text-[10px] font-black uppercase text-muted">Discount %</label>
          <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-full app-input" required />
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-black uppercase text-muted">Expiry Date</label>
          <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="w-full app-input" required />
        </div>
        <button className="app-btn p-3 rounded-lg"><FaPlus /></button>
      </form>

      {/* Coupon List */}
      <div className="app-card overflow-hidden">
      <table className="w-full">
        <thead className="bg-surface-2 border-b border-app">
          <tr>
            <th className="p-4 text-left text-xs font-black uppercase">Code</th>
            <th className="p-4 text-left text-xs font-black uppercase">Discount</th>
            <th className="p-4 text-left text-xs font-black uppercase">Expires</th>
            <th className="p-4 text-left text-xs font-black uppercase">Status</th>
            <th className="p-4 text-left text-xs font-black uppercase">Action</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((c) => (
            <tr key={c._id} className="border-b border-app last:border-0">
              <td className="p-4 font-bold text-foreground">{c.name}</td>
              <td className="p-4 text-muted">{c.discount}%</td>
              <td className="p-4 text-muted">{new Date(c.expiry).toLocaleDateString()}</td>
              <td className="p-4">
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {c.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleActiveHandler(c)}
                    className="text-primary"
                    title={c.isActive ? 'Deactivate coupon' : 'Activate coupon'}
                  >
                    {c.isActive ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
                  </button>
                  <button onClick={() => deleteHandler(c._id)} className="text-red-500" title="Delete coupon"><FaTrash /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default CouponListScreen;