import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTrash, FaPlus } from 'react-icons/fa';

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

  return (
    <div className="fs-container fs-section">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black uppercase text-slate-900">Coupon Management</h1>
        <span className="fs-pill">Admin</span>
      </div>
      
      {/* Create Form */}
      <form onSubmit={submitHandler} className="fs-card p-6 mb-10 flex flex-col lg:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="text-[10px] font-semibold uppercase text-slate-400 tracking-[0.2em]">Code</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="fs-input" placeholder="FLIT10" required />
        </div>
        <div className="w-full lg:w-32">
          <label className="text-[10px] font-semibold uppercase text-slate-400 tracking-[0.2em]">Discount %</label>
          <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="fs-input" required />
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-semibold uppercase text-slate-400 tracking-[0.2em]">Expiry Date</label>
          <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="fs-input" required />
        </div>
        <button className="fs-button-primary px-5 py-3"><FaPlus /></button>
      </form>

      {/* Coupon List */}
      <div className="fs-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/80 border-b border-slate-100">
            <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              <th className="p-4">Code</th>
              <th className="p-4">Discount</th>
              <th className="p-4">Expires</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {coupons.map((c) => (
              <tr key={c._id} className="hover:bg-sky-50/40 transition">
                <td className="p-4 font-semibold text-slate-800">{c.name}</td>
                <td className="p-4 text-slate-600">{c.discount}%</td>
                <td className="p-4 text-slate-600">{new Date(c.expiry).toLocaleDateString()}</td>
                <td className="p-4">
                  <button onClick={() => deleteHandler(c._id)} className="text-red-500"><FaTrash /></button>
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