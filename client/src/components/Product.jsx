import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../slices/cartSlice";
import { FaStar } from "react-icons/fa";
import { toast } from "react-toastify";

const Product = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 1. Define the SVG as a constant
  // We use encodeURIComponent-style characters (like %23 for #) to ensure browser compatibility
  const defaultSVG = `data:image/svg+xml;utf8,<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect fill="%23e0e7ef" width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="40" fill="%239ca3af">🛒</text></svg>`;

  // 2. Logic to decide which image to show initially
  const getProductImage = () => {
    if (product.image && product.image.trim() !== "") {
      // Add cache busting to ensure live updates
      return `${product.image}?t=${new Date(product.updatedAt).getTime()}`;
    }
    return defaultSVG;
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (Number(product.countInStock || 0) <= 0) {
      toast.error("Item is out of stock");
      return;
    }
    dispatch(addToCart({ ...product, qty: 1 }));
    toast.success("Added to cart!");
    navigate("/cart");
  };

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-surface flex flex-col group border border-app">
      <Link to={`/product/${product._id}`} className="block">
        <div className="aspect-w-4 aspect-h-3 w-full bg-app flex items-center justify-center overflow-hidden">
          <img
            src={getProductImage()}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
            // 3. Fallback logic: If the provided URL breaks, load the SVG instead
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = defaultSVG;
            }}
          />
        </div>
      </Link>

      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-foreground hover:text-primary truncate transition-colors">
            <Link to={`/product/${product._id}`}>{product.name}</Link>
          </h3>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-app px-2 py-1 rounded-full border border-primary">
              Premium
            </span>
          </div>

          <div className="flex items-center">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={i < product.rating ? "text-primary" : "text-muted"}
                />
              ))}
            </div>
            <span className="text-muted text-sm ml-2">
              {product.numReviews} reviews
            </span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-app flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-muted uppercase tracking-widest">
              Price
            </span>
            <span className="text-2xl font-extrabold text-foreground">
              ₹{product.price}
            </span>
          </div>
          <button
            className={`rounded-lg px-5 py-2 text-sm focus:outline-none focus:ring-2 ${
              Number(product.countInStock || 0) <= 0
                ? "border border-danger text-danger bg-danger/10 hover:bg-danger/20"
                : "app-btn focus:ring-primary"
            }`}
            onClick={handleAddToCart}
          >
            {Number(product.countInStock || 0) <= 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Product;