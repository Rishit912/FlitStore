import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const TrackingScreen = () => {
  const { token } = useParams();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const res = await fetch(`/api/orders/track/${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Unable to load tracking');
        setTracking(data);
      } catch (err) {
        toast.error(err.message || 'Tracking failed');
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [token]);

  if (loading) {
    return (
      <div className="fs-container fs-section">
        <div className="fs-card p-6 text-slate-400">Loading tracking...</div>
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="fs-container fs-section">
        <div className="fs-card p-6 text-slate-400">Tracking link is invalid.</div>
      </div>
    );
  }

  const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');
  const isDelivered = tracking.isDelivered;
  const isPaid = tracking.isPaid;
  const isCancelled = tracking.isCancelled;
  const isReturned = tracking.isReturned;
  const estimatedDelivery = isDelivered
    ? tracking.deliveredAt
    : isPaid
      ? new Date(new Date(tracking.createdAt).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString()
      : null;

  return (
    <div className="fs-container fs-section">
      <div className="fs-card p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <p className="fs-pill w-fit">Track your order</p>
            <h1 className="text-3xl font-black text-slate-900 mt-4">Order Tracking</h1>
            <p className="text-slate-500 mt-2">Tracking ID: {tracking.trackingId}</p>
          </div>
          <div className={`px-4 py-2 rounded-full font-semibold text-sm ${isDelivered ? 'bg-emerald-100 text-emerald-700' : isCancelled ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
            {isDelivered ? 'Delivered' : isCancelled ? 'Cancelled' : 'In Progress'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">Order placed</p>
            <p className="text-sm font-semibold text-slate-900">{formatDate(tracking.createdAt)}</p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">Payment</p>
            <p className="text-sm font-semibold text-slate-900">{isPaid ? `Paid on ${formatDate(tracking.paidAt)}` : 'Pending'}</p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">Estimated delivery</p>
            <p className="text-sm font-semibold text-slate-900">{formatDate(estimatedDelivery)}</p>
          </div>
        </div>

        {isCancelled && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            This order has been cancelled.
          </div>
        )}

        {isReturned && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-700 mt-4">
            Return requested. Status: {tracking.returnStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingScreen;
