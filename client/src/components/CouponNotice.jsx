import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const CouponNotice = ({ className = '' }) => {
  const [coupon, setCoupon] = useState(null);
  const lastToastKeyRef = useRef('');

  useEffect(() => {
    const loadCoupon = async () => {
      try {
        const { data } = await axios.get('/api/coupons/active');
        setCoupon(data || null);
      } catch {
        setCoupon(null);
      }
    };

    loadCoupon();
    const intervalId = setInterval(loadCoupon, 30000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!coupon) return;

    const toastKey = `${coupon._id || coupon.name}-${coupon.updatedAt || coupon.expiry}`;
    if (lastToastKeyRef.current === toastKey) return;

    lastToastKeyRef.current = toastKey;
    toast.info(`Coupon ${coupon.name} is live now. Use ${coupon.discount}% off before ${new Date(coupon.expiry).toLocaleDateString()}.`, {
      toastId: `coupon-toast-${toastKey}`,
      autoClose: 4500,
    });
  }, [coupon]);

  if (!coupon) return null;

  return (
    <div className={`bg-gradient-to-r from-primary to-accent-3 text-white border-b border-white/10 shadow-lg ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="text-sm font-bold tracking-wide uppercase">
          Active Offer: <span className="text-yellow-300">{coupon.name}</span> gives <span className="text-yellow-300">{coupon.discount}% off</span>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <span className="opacity-90">Valid until {new Date(coupon.expiry).toLocaleDateString()}</span>
          <Link to="/cart" className="bg-white text-primary font-black uppercase tracking-widest px-3 py-1.5 rounded-full hover:bg-yellow-50 transition">
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CouponNotice;