import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const ReviewModerationScreen = () => {
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const { data } = await axios.get('/api/products/reviews/pending');
      setPendingReviews(data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load pending reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const approveHandler = async (productId, reviewId) => {
    try {
      await axios.put(`/api/products/${productId}/reviews/${reviewId}/approve`);
      toast.success('Review approved');
      fetchPending();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve');
    }
  };

  const rejectHandler = async (productId, reviewId) => {
    if (!window.confirm('Reject this review?')) return;
    try {
      await axios.delete(`/api/products/${productId}/reviews/${reviewId}/reject`);
      toast.info('Review rejected');
      fetchPending();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject');
    }
  };

  const replyHandler = async (productId, reviewId) => {
    const reply = window.prompt('Admin reply');
    if (!reply) return;

    try {
      await axios.put(`/api/products/${productId}/reviews/${reviewId}/reply`, { reply });
      toast.success('Reply saved');
      fetchPending();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reply');
    }
  };

  return (
    <div className="fs-container fs-section">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Review Moderation</h1>
          <p className="text-slate-500 font-semibold text-xs uppercase tracking-[0.2em] mt-1">Approve, reject, and reply</p>
        </div>
      </div>

      {loading ? (
        <div className="fs-card p-6 text-slate-400">Loading pending reviews...</div>
      ) : pendingReviews.length === 0 ? (
        <div className="fs-card p-6 text-slate-400">No pending reviews.</div>
      ) : (
        <div className="space-y-4">
          {pendingReviews.map((review) => (
            <div key={`${review.productId}-${review.reviewId}`} className="fs-card p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{review.productName}</p>
                  <p className="text-xs text-slate-400">By {review.name} • {review.createdAt?.substring(0, 10)}</p>
                </div>
                <span className="text-xs font-semibold text-amber-600">Rating: {review.rating}</span>
              </div>
              <p className="text-sm text-slate-600 mt-3">{review.comment}</p>
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={() => approveHandler(review.productId, review.reviewId)}
                  className="fs-button-primary px-4 py-2 text-xs uppercase tracking-[0.2em]"
                >
                  Approve
                </button>
                <button
                  onClick={() => rejectHandler(review.productId, review.reviewId)}
                  className="fs-button-ghost px-4 py-2 text-xs text-rose-600"
                >
                  Reject
                </button>
                <button
                  onClick={() => replyHandler(review.productId, review.reviewId)}
                  className="fs-button-ghost px-4 py-2 text-xs"
                >
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewModerationScreen;
