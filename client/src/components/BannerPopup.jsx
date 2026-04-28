import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';

const BannerPopup = () => {
  const [banner, setBanner] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const { pathname } = useLocation();

  const isDashboardRoute = pathname.startsWith('/admin') || pathname === '/retailer/dashboard';

  const dismissKey = useMemo(() => {
    if (!banner) return null;
    return `flitstore-banner-dismissed:${banner._id || banner.updatedAt || banner.title || 'default'}`;
  }, [banner]);

  useEffect(() => {
    if (!isDashboardRoute) {
      setIsVisible(false);
      return undefined;
    }

    const loadBanner = async () => {
      try {
        const { data } = await axios.get('/api/banner');
        if (data && Object.keys(data).length > 0) {
          setBanner(data);
        }
      } catch {
        setBanner(null);
      }
    };

    loadBanner();
  }, [isDashboardRoute]);

  useEffect(() => {
    if (!isDashboardRoute || !banner || !dismissKey || typeof window === 'undefined') return;

    const dismissed = window.localStorage.getItem(dismissKey);
    if (!dismissed) {
      const timer = window.setTimeout(() => setIsVisible(true), 250);
      return () => window.clearTimeout(timer);
    }

    setIsVisible(false);
    return undefined;
  }, [banner, dismissKey, isDashboardRoute]);

  useEffect(() => {
    if (!isVisible || typeof document === 'undefined') return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isVisible]);

  const closeHandler = () => {
    if (dismissKey && typeof window !== 'undefined') {
      window.localStorage.setItem(dismissKey, '1');
    }
    setIsVisible(false);
  };

  if (!isDashboardRoute || !banner || !isVisible) return null;

  const textColor = banner.textColor || '#111827';
  const panelStyle = {
    backgroundColor: banner.backgroundColor || '#ffffff',
    backgroundImage: banner.backgroundImage ? `linear-gradient(rgba(255,255,255,0.84), rgba(255,255,255,0.84)), url(${banner.backgroundImage})` : undefined,
    backgroundSize: banner.backgroundImage ? 'cover' : undefined,
    backgroundPosition: 'center',
    color: textColor,
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 backdrop-blur-sm px-4 py-6">
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/20 shadow-2xl animate-fade-up"
        style={panelStyle}
      >
        <button
          type="button"
          onClick={closeHandler}
          aria-label="Close promotional banner"
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/10 text-foreground transition hover:bg-black/20"
        >
          <span className="text-2xl leading-none">&times;</span>
        </button>

        <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6 sm:p-8 md:p-10">
            <div
              className="inline-flex items-center rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-[0.35em]"
              style={{
                backgroundColor: banner.badgeBgColor || 'rgba(37, 99, 235, 0.1)',
                color: banner.accentColor || '#2563eb',
              }}
            >
              {banner.badgeText || 'New Offer'}
            </div>

            <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">
              {banner.title || 'FlitStore Special Offer'}
            </h2>

            {banner.highlight ? (
              <p className="mt-3 text-2xl font-black" style={{ color: banner.accentColor || '#2563eb' }}>
                {banner.highlight}
              </p>
            ) : null}

            <p className="mt-4 max-w-xl text-sm leading-6 sm:text-base opacity-90">
              {banner.subtitle || 'Shop now to unlock the latest seasonal discount.'}
            </p>

            {banner.promoText ? (
              <div
                className="mt-6 inline-flex rounded-2xl px-4 py-3 text-sm font-bold"
                style={{
                  backgroundColor: banner.promoBgColor || 'rgba(239, 246, 255, 0.92)',
                }}
              >
                {banner.promoText}
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to={banner.ctaLink || '/'}
                onClick={closeHandler}
                className="rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.25em] text-white shadow-lg transition hover:opacity-90"
                style={{ backgroundColor: banner.accentColor || '#2563eb' }}
              >
                {banner.ctaText || 'Shop Now'}
              </Link>
              <button
                type="button"
                onClick={closeHandler}
                className="rounded-full border border-black/10 px-6 py-3 text-sm font-black uppercase tracking-[0.25em] text-foreground transition hover:bg-black/5"
              >
                Maybe later
              </button>
            </div>
          </div>

          <div className="relative min-h-[220px] md:min-h-full bg-black/5">
            {banner.image ? (
              <img
                src={banner.image}
                alt={banner.title || 'Promotional banner'}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[260px] items-center justify-center p-8 text-center">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.35em] opacity-70">FlitStore</div>
                  <div className="mt-3 text-2xl font-black">Summer Sale</div>
                  <div className="mt-2 text-sm opacity-80">Fresh styles, smart prices, limited-time deals.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerPopup;