import React from "react";

import { Link } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../slices/cartSlice';

import { FaStar } from "react-icons/fa";

const Product = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const addToCartHandler = () => {
    if (product.countInStock === 0) return;
    dispatch(addToCart({ ...product, price: product.price, originalPrice: product.price, qty: 1 }));
    navigate('/cart');
  };

  return (
    <div className="fs-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_-60px_rgba(14,165,233,0.6)]">
      <Link to={`/product/${product._id}`} className="block relative">
        <img
          src={product.image || '/placeholder-product.svg'}
          alt={product.name}
          className="w-full h-64 object-cover object-center"
        />
        <div className="absolute top-4 left-4 fs-pill bg-white/90">New Drop</div>
      </Link>

      <div className="p-5">
        <Link to={`/product/${product._id}`}>
          <h3 className="text-lg font-semibold text-slate-900 hover:text-sky-700 truncate">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center mt-2 mb-5">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={i < product.rating ? 'text-amber-400' : 'text-slate-200'} />
            ))}
          </div>
          <span className="text-slate-500 text-xs ml-2 font-semibold uppercase tracking-[0.2em]">
            {product.numReviews} reviews
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-semibold text-slate-900">₹{product.price}</span>
          <button
            onClick={addToCartHandler}
            disabled={product.countInStock === 0}
            className={`fs-button-primary px-4 py-2 text-sm ${
              product.countInStock === 0 ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Product;