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
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-black uppercase mb-6">Coupon Management</h1>
      
      {/* Create Form */}
      <form onSubmit={submitHandler} className="bg-white p-6 rounded-2xl shadow-sm mb-10 flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-[10px] font-black uppercase text-gray-400">Code</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2 rounded-lg" placeholder="FLIT10" required />
        </div>
        <div className="w-32">
          <label className="text-[10px] font-black uppercase text-gray-400">Discount %</label>
          <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-full border p-2 rounded-lg" required />
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-black uppercase text-gray-400">Expiry Date</label>
          <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="w-full border p-2 rounded-lg" required />
        </div>
        <button className="bg-blue-600 text-white p-3 rounded-lg"><FaPlus /></button>
      </form>

      {/* Coupon List */}
      <table className="w-full bg-white rounded-2xl overflow-hidden shadow-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-4 text-left text-xs font-black uppercase">Code</th>
            <th className="p-4 text-left text-xs font-black uppercase">Discount</th>
            <th className="p-4 text-left text-xs font-black uppercase">Expires</th>
            <th className="p-4 text-left text-xs font-black uppercase">Action</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((c) => (
            <tr key={c._id} className="border-b last:border-0">
              <td className="p-4 font-bold">{c.name}</td>
              <td className="p-4">{c.discount}%</td>
              <td className="p-4">{new Date(c.expiry).toLocaleDateString()}</td>
              <td className="p-4">
                <button onClick={() => deleteHandler(c._id)} className="text-red-500"><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CouponListScreen;