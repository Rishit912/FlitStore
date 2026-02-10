import React from 'react';
import Rating from './Rating';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-16">
      <div className="fs-container">
        <div className="fs-card p-8 flex flex-col lg:flex-row gap-8 lg:items-center lg:justify-between">
          <div>
            <p className="fs-pill w-fit">Trusted by shoppers</p>
            <h3 className="text-2xl font-black text-slate-900 mt-3">FlitStore Community Rating</h3>
            <p className="text-slate-500 mt-2 max-w-md">
              Real reviews from verified customers. We keep quality high and returns easy.
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-4">
            <Rating value={4.8} text="1,240 reviews" />
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <Link to="/" className="hover:text-slate-900">Home</Link>
              <Link to="/cart" className="hover:text-slate-900">Cart</Link>
              <Link to="/profile" className="hover:text-slate-900">Account</Link>
            </div>
          </div>
        </div>

        <div className="py-6 text-center text-xs uppercase tracking-[0.2em] text-slate-400">
          Built for everyday upgrades.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
