import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const BannerPopup = () => {
  const [banner, setBanner] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const dismissKey = useMemo(() => {
    if (!banner) return null;
    return `flitstore-banner-dismissed:${banner._id || banner.updatedAt || banner.title || 'default'}`;
  }, [banner]);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!banner || !dismissKey || typeof window === 'undefined') return;

    const dismissed = window.localStorage.getItem(dismissKey);
    if (!dismissed) {
      const timer = window.setTimeout(() => setIsVisible(true), 250);
      return () => window.clearTimeout(timer);
    }

    setIsVisible(false);
    return undefined;
  }, [banner, dismissKey]);

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

  if (!banner || !isVisible) return null;

  const textColor = banner.textColor || '#111827';
  const accentColor = banner.accentColor || '#2563eb';
  const badgeText = banner.badgeText || 'New Offer';
  const titleText = banner.title || 'Summer Big Sale';
  const highlightText = banner.highlight || 'Save big on your favorite picks';
  const subtitleText = banner.subtitle || 'Fresh arrivals, limited-time deals, and smarter prices for everyone.';
  const panelStyle = {
    backgroundColor: banner.backgroundColor || '#ffffff',
    backgroundImage: banner.backgroundImage ? `linear-gradient(rgba(255,255,255,0.78), rgba(255,255,255,0.84)), url(${banner.backgroundImage})` : undefined,
    backgroundSize: banner.backgroundImage ? 'cover' : undefined,
    backgroundPosition: 'center',
    color: textColor,
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md px-4 py-6">
      <div
        className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/20 shadow-2xl animate-fade-up"
        style={panelStyle}
      >
        <button
          type="button"
          onClick={closeHandler}
          aria-label="Close promotional banner"
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/15 text-foreground transition hover:bg-black/30"
        >
          <span className="text-2xl leading-none">&times;</span>
        </button>

        <div className="grid gap-0 md:grid-cols-[1.15fr_0.85fr]">
          <div className="p-6 sm:p-8 md:p-12">
            <div
              className="inline-flex items-center rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-[0.35em]"
              style={{
                backgroundColor: banner.badgeBgColor || 'rgba(37, 99, 235, 0.1)',
                color: accentColor,
              }}
            >
              {badgeText}
            </div>

            <h2 className="mt-5 max-w-xl text-4xl font-black leading-tight sm:text-5xl">
              {titleText}
            </h2>

            <p className="mt-4 text-3xl font-black sm:text-4xl" style={{ color: accentColor }}>
              {highlightText}
            </p>

            <p className="mt-4 max-w-xl text-sm leading-6 sm:text-base opacity-90">
              {subtitleText}
            </p>

            {banner.promoText ? (
              <div
                className="mt-6 inline-flex rounded-2xl px-4 py-3 text-sm font-bold shadow-lg"
                style={{
                  backgroundColor: banner.promoBgColor || 'rgba(239, 246, 255, 0.94)',
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
                style={{ backgroundColor: accentColor }}
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

          <div className="relative min-h-[280px] bg-black/5 md:min-h-full">
            {banner.image ? (
              <img
                src={banner.image}
                alt={banner.title || 'Promotional banner'}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[280px] items-center justify-center bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-400 p-8 text-center text-white">
                <div className="max-w-xs">
                  <div className="text-xs font-black uppercase tracking-[0.45em] opacity-80">FlitStore</div>
                  <div className="mt-3 text-3xl font-black uppercase tracking-tight">Summer Big Sale</div>
                  <div className="mt-3 text-sm leading-6 opacity-90">New offer for shoppers entering the store today.</div>
                  <div className="mt-6 inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.3em]">
                    Open now
                  </div>
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