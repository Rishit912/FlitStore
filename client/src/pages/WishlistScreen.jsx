import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { addToCart } from '../slices/cartSlice';

const WishlistScreen = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get('/api/users/wishlist');
      setWishlist(data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [userInfo, navigate]);

  const removeHandler = async (productId) => {
    try {
      const { data } = await axios.delete(`/api/users/wishlist/${productId}`);
      setWishlist(data || []);
      toast.info('Removed from wishlist');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to remove');
    }
  };

  const moveToCartHandler = (item) => {
    dispatch(addToCart({ ...item, qty: 1 }));
    toast.success('Added to cart');
  };

  if (loading) {
    return (
      <div className="fs-container fs-section">
        <div className="fs-card p-6 text-slate-400">Loading wishlist...</div>
      </div>
    );
  }

  return (
    <div className="fs-container fs-section">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-slate-900">Wishlist</h1>
        <span className="fs-pill">Saved for later</span>
      </div>

      {wishlist.length === 0 ? (
        <div className="fs-card p-6 text-slate-600">
          Your wishlist is empty. <Link to="/" className="font-semibold text-sky-700">Browse products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {wishlist.map((item) => (
            <div key={item._id} className="fs-card p-4 flex items-center gap-4">
              <img src={item.image || '/placeholder-product.svg'} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
              <div className="flex-1">
                <Link to={`/product/${item._id}`} className="font-semibold text-slate-900 hover:text-sky-700">
                  {item.name}
                </Link>
                <p className="text-slate-500">₹{item.price}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => moveToCartHandler(item)}
                    className="fs-button-primary px-4 py-2 text-xs uppercase tracking-[0.2em]"
                  >
                    Add to cart
                  </button>
                  <button
                    onClick={() => removeHandler(item._id)}
                    className="fs-button-ghost px-4 py-2 text-xs text-rose-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistScreen;
