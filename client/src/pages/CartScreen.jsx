import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaTrash } from 'react-icons/fa';
import { addToCart, removeFromCart, saveForLater, moveToCart, removeSavedItem } from '../slices/cartSlice';

const CartScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. Get Cart Data from Redux Store
  const cart = useSelector((state) => state.cart);
  const { cartItems, savedItems } = cart;
  const safeCartItems = Array.isArray(cartItems)
    ? cartItems.filter((item) => item && item._id)
    : [];
  const safeSavedItems = Array.isArray(savedItems)
    ? savedItems.filter((item) => item && item._id)
    : [];

  const checkoutHandler = () => {
    // This will eventually go to login/payment
    navigate('/login?redirect=/shipping');
  };

  return (
    <div className="fs-container fs-section">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-slate-900">Shopping Cart</h1>
        <span className="fs-pill">Secure checkout</span>
      </div>

      {safeCartItems.length === 0 ? (
        <div className="fs-card p-6 text-slate-600">
          Your cart is empty. <Link to="/" className="font-semibold text-sky-700">Go Back</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {safeCartItems.map((item) => (
              <div key={item._id} className="fs-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={item.image || '/placeholder-product.svg'} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                  <div>
                    <Link to={`/product/${item._id}`} className="font-semibold text-slate-900 hover:text-sky-700">
                      {item.name}
                    </Link>
                    <p className="text-slate-500">₹{item.price}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select 
                    value={item.qty} 
                    onChange={(e) => dispatch(addToCart({ ...item, qty: Number(e.target.value) }))}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm"
                  >
                    {[...Array(item.countInStock).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>{x + 1}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => dispatch(saveForLater(item._id))}
                    className="text-slate-600 hover:text-slate-900 text-xs font-semibold"
                  >
                    Save for later
                  </button>

                  <button 
                    onClick={() => dispatch(removeFromCart(item._id))}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}

            {safeSavedItems.length > 0 && (
              <div className="fs-card p-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Saved for later</h3>
                <div className="space-y-3">
                  {safeSavedItems.map((item) => (
                    <div key={item._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img src={item.image || '/placeholder-product.svg'} alt={item.name} className="w-16 h-16 object-cover rounded-xl" />
                        <div>
                          <Link to={`/product/${item._id}`} className="font-semibold text-slate-900 hover:text-sky-700">
                            {item.name}
                          </Link>
                          <p className="text-slate-500">₹{item.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => dispatch(moveToCart(item._id))}
                          className="fs-button-primary px-4 py-2 text-xs uppercase tracking-[0.2em]"
                        >
                          Move to cart
                        </button>
                        <button
                          onClick={() => dispatch(removeSavedItem(item._id))}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="fs-card p-6 h-fit">
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">
              Subtotal ({safeCartItems.reduce((acc, item) => acc + item.qty, 0)}) items
            </h2>
            <p className="text-xl font-semibold text-slate-800 mb-6">
              Total: ₹{safeCartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}
            </p>
            <button 
              onClick={checkoutHandler}
              className="w-full fs-button-primary py-3"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartScreen;