import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaTrash } from 'react-icons/fa';
import { addToCart, removeFromCart } from '../slices/cartSlice';

const CartScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. Get Cart Data from Redux Store
  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const checkoutHandler = () => {
    // This will eventually go to login/payment
    navigate('/login?redirect=/shipping');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="bg-blue-50 p-4 rounded-lg text-blue-800">
          Your cart is empty. <Link to="/" className="font-bold underline">Go Back</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item._id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                
                <div className="flex-1 ml-4">
                  <Link to={`/product/${item._id}`} className="font-bold text-gray-800 hover:text-blue-600">
                    {item.name}
                  </Link>
                  <p className="text-gray-500">₹{item.price}</p>
                </div>

                {/* Update Qty in Cart */}
                <select 
                  value={item.qty} 
                  onChange={(e) => dispatch(addToCart({ ...item, qty: Number(e.target.value) }))}
                  className="border rounded mx-2 p-1"
                >
                  {[...Array(item.countInStock).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>{x + 1}</option>
                  ))}
                </select>

                {/* Remove Button */}
                <button 
  // IMPORTANT: We must pass item._id here. 
  // If you just wrote removeFromCart(), it won't work.
  onClick={() => dispatch(removeFromCart(item._id))}
  className="text-red-500 hover:text-red-700 p-2"
>
  <FaTrash />
</button>
              </div>
            ))}
          </div>

          {/* Right: Subtotal Box */}
          <div className="bg-white p-6 rounded-xl shadow-lg h-fit">
            <h2 className="text-2xl font-bold mb-4">
              Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)}) items
            </h2>
            <p className="text-xl font-bold text-gray-800 mb-6">
              Total: ₹{cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}
            </p>
            <button 
              onClick={checkoutHandler}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
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