import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AiDiscountScreen = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await axios.get('/api/orders/ai-discounts');
        setSummary(data);
      } catch (error) {
        toast.error('Failed to load AI discount analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return <div className="fs-container fs-section">Loading analytics...</div>;
  }

  if (!summary) {
    return <div className="fs-container fs-section">No AI discount data yet.</div>;
  }

  return (
    <div className="fs-container fs-section">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <p className="fs-pill w-fit">AI Dazzler</p>
          <h1 className="text-3xl font-black text-slate-900 mt-3">Discount analytics</h1>
          <p className="text-slate-500">Track discounts offered by AI negotiations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="fs-card p-6 rounded-2xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">Total discounts</p>
          <p className="text-3xl font-semibold text-slate-900">₹{summary.totalDiscount.toFixed(2)}</p>
        </div>
        <div className="fs-card p-6 rounded-2xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">Avg discount / order</p>
          <p className="text-3xl font-semibold text-slate-900">₹{summary.avgDiscount.toFixed(2)}</p>
        </div>
        <div className="fs-card p-6 rounded-2xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">Orders with AI discount</p>
          <p className="text-3xl font-semibold text-slate-900">{summary.aiOrdersCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="fs-card p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Top discounted products</h2>
          {summary.topProducts.length === 0 ? (
            <p className="text-slate-500">No discounts yet.</p>
          ) : (
            <div className="space-y-3">
              {summary.topProducts.map((item) => (
                <div key={item.name} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
                  <span className="text-slate-700 font-semibold">{item.name}</span>
                  <span className="text-slate-900 font-semibold">₹{item.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="fs-card p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Revenue impact</h2>
          <div className="space-y-3 text-slate-600">
            <div className="flex justify-between">
              <span>Revenue before discounts</span>
              <span>₹{summary.revenueBefore.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Revenue after discounts</span>
              <span>₹{summary.revenueAfter.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-900 border-t border-slate-100 pt-3">
              <span>Net discount impact</span>
              <span>-₹{summary.totalDiscount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiDiscountScreen;
