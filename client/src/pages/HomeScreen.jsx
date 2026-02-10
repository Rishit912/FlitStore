import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom'; // 🟢 Needed to grab the search keyword
import axios from 'axios';
import Product from '../components/Product';
import { listProducts } from '../actions/productActions'; // Ensure this action exists
import { getHomeConfig } from '../utils/homeConfig';

const HomeScreen = () => {
  const { keyword } = useParams(); // 🟢 Extracts the keyword from the URL
  const dispatch = useDispatch();

  // Pulling state from Redux instead of local useState
  const productList = useSelector((state) => state.productList);
  const { loading, error, products } = productList;
  const { userInfo } = useSelector((state) => state.auth);

  const [homeConfig, setHomeConfigState] = useState(getHomeConfig());
  const [heroContent, setHeroContent] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);

  const fallbackCategories = [
    { title: 'Audio & Wearables', note: 'Focused listening', icon: 'fas fa-headphones' },
    { title: 'Smart Home', note: 'Comfort upgrades', icon: 'fas fa-house' },
    { title: 'Travel Gear', note: 'Lightweight carry', icon: 'fas fa-briefcase' },
    { title: 'Work Essentials', note: 'Desk-ready picks', icon: 'fas fa-laptop' },
  ];
  const featuredCategories = homeConfig.featuredCategories.length
    ? homeConfig.featuredCategories.map((name) => ({ title: name, note: 'Curated by admin', icon: 'fas fa-tags' }))
    : fallbackCategories;

  const categorySectionNames = [
    'Men',
    'Women',
    'Boys',
    'Girls',
    'Kids',
    'Footwear',
    'Accessories',
    'Electronics',
    'Home',
    'Beauty',
    'Sports',
  ];

  const categorySections = useMemo(() => {
    if (!products) return [];
    const normalize = (value) => String(value || '').trim().toLowerCase();
    return categorySectionNames
      .map((category) => {
        const items = products.filter(
          (product) => normalize(product.category) === normalize(category)
        );
        return { category, items: items.slice(0, 4) };
      })
      .filter((section) => section.items.length > 0);
  }, [products]);

  const revealDirection = (index) => {
    const directions = ['reveal-from-up', 'reveal-from-right', 'reveal-from-down', 'reveal-from-left'];
    return directions[index % directions.length];
  };

  const deals = useMemo(() => {
    if (!products) return [];
    const sorted = [...products];
    if (homeConfig.dealsSort === 'price-asc') {
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (homeConfig.dealsSort === 'price-desc') {
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (homeConfig.dealsSort === 'rating-desc') {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return sorted.slice(0, 8);
  }, [products, homeConfig.dealsSort]);

  const bestSellers = useMemo(() => {
    if (!products) return [];
    const sorted = [...products];
    if (homeConfig.bestSort === 'reviews-desc') {
      sorted.sort((a, b) => (b.numReviews || 0) - (a.numReviews || 0));
    } else if (homeConfig.bestSort === 'rating-desc') {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (homeConfig.bestSort === 'price-desc') {
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    return sorted.slice(0, 4);
  }, [products, homeConfig.bestSort]);

  const newArrivals = useMemo(() => {
    if (!products) return [];
    const sorted = [...products];
    if (homeConfig.newSort === 'created-desc') {
      sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (homeConfig.newSort === 'created-asc') {
      sorted.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (homeConfig.newSort === 'price-desc') {
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    return sorted.slice(0, 8);
  }, [products, homeConfig.newSort]);

  const adminStats = useMemo(() => {
    const totalProducts = products ? products.length : 0;
    const avgPrice = products && products.length
      ? products.reduce((sum, item) => sum + (item.price || 0), 0) / products.length
      : 0;
    const lowStock = products
      ? products.filter((item) => (item.countInStock || 0) <= 3).length
      : 0;
    const topRated = products
      ? products.filter((item) => (item.rating || 0) >= 4.5).length
      : 0;
    return { totalProducts, avgPrice, lowStock, topRated };
  }, [products]);

  useEffect(() => {
    // Every time the keyword in the URL changes, we re-fetch
    dispatch(listProducts(keyword));
  }, [dispatch, keyword]);

  useEffect(() => {
    const handler = () => setHomeConfigState(getHomeConfig());
    window.addEventListener('flitHomeConfigUpdated', handler);
    return () => window.removeEventListener('flitHomeConfigUpdated', handler);
  }, []);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const { data } = await axios.get('/api/homecontent');
        const heroes = data?.heroes?.length
          ? data.heroes
          : data?.hero
            ? [data.hero]
            : [];
        setHeroContent(heroes);
      } catch (err) {
        setHeroContent([]);
      }
    };
    fetchHero();
  }, []);

  useEffect(() => {
    const refreshHero = () => {
      axios.get('/api/homecontent')
        .then((res) => {
          const heroes = res.data?.heroes?.length
            ? res.data.heroes
            : res.data?.hero
              ? [res.data.hero]
              : [];
          setHeroContent(heroes);
        })
        .catch(() => {});
    };
    window.addEventListener('flitHeroUpdated', refreshHero);
    return () => window.removeEventListener('flitHeroUpdated', refreshHero);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio >= 0.2) {
            entry.target.classList.add('is-visible');
          } else if (entry.intersectionRatio === 0) {
            entry.target.classList.remove('is-visible');
          }
        });
      },
      { threshold: [0, 0.2], rootMargin: '0px 0px -10% 0px' }
    );

    const observeTargets = () => {
      const targets = document.querySelectorAll('.reveal-on-scroll:not(.is-visible)');
      const viewportTrigger = window.innerHeight * 0.9;
      targets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= viewportTrigger) {
          el.classList.add('is-visible');
        } else {
          observer.observe(el);
        }
      });
    };

    observeTargets();

    const mutationObserver = new MutationObserver(() => {
      observeTargets();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  const now = new Date();
  const activeHeroes = heroContent.filter((item) => {
    const start = item.startDate ? new Date(item.startDate) : null;
    const end = item.endDate ? new Date(item.endDate) : null;
    const withinRange = (!start || now >= start) && (!end || now <= end);
    return item.isActive !== false && withinRange;
  });

  useEffect(() => {
    setHeroIndex(0);
  }, [activeHeroes.length]);

  useEffect(() => {
    if (activeHeroes.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % activeHeroes.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeHeroes.length]);

  const hero = activeHeroes[heroIndex] || {};
  const heroActive = activeHeroes.length > 0;
  const heroTitle = hero.title || 'Curated essentials for the way you live today.';
  const heroSubtitle = hero.subtitle || 'FlitStore brings together crafted electronics, home comforts, and travel-ready picks so every day feels a little more intentional.';
  const heroBadge = hero.badge || 'Seasonal Highlights';
  const heroCtaText = hero.ctaText || 'Shop the drop';
  const heroCtaLink = hero.ctaLink || '#latest';
  const heroBanner = hero.bannerImage || '/hero-showcase.svg';
  const heroStyle = heroActive
    ? {
        backgroundColor: hero.backgroundColor || 'transparent',
        backgroundImage: hero.backgroundImage ? `url(${hero.backgroundImage})` : undefined,
        backgroundSize: hero.backgroundImage ? 'cover' : undefined,
        backgroundPosition: hero.backgroundImage ? 'center' : undefined,
      }
    : {};

  return (
    <div className="fs-container">
      {!keyword && (
        <section className="fs-section reveal-on-scroll grid grid-cols-1 lg:grid-cols-2 gap-10 items-center rounded-[2.5rem] p-6 md:p-10" style={heroStyle}>
        <div className="space-y-6 reveal-up">
          <div className="fs-pill w-fit">{heroBadge}</div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            {heroTitle}
          </h1>
          <p className="text-lg text-slate-600 max-w-xl">
            {heroSubtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <a href={heroCtaLink} className="fs-button-primary px-6 py-3 text-sm">{heroCtaText}</a>
            <a href="#collections" className="fs-button-ghost px-6 py-3 text-sm text-slate-700">Browse collections</a>
          </div>
          {hero.discountText && (
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]">
              {hero.discountText}
            </div>
          )}
          <div className="flex flex-wrap gap-6 pt-4 text-sm text-slate-500">
            <div>
              <div className="text-2xl font-semibold text-slate-900">48h</div>
              <div className="uppercase tracking-[0.2em] text-[11px]">Fast delivery</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900">120+</div>
              <div className="uppercase tracking-[0.2em] text-[11px]">Fresh arrivals</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900">4.9</div>
              <div className="uppercase tracking-[0.2em] text-[11px]">Community rated</div>
            </div>
          </div>
        </div>

        <div className="relative">
          <img
            src={heroBanner}
            alt="FlitStore hero"
            className="w-full rounded-[2.5rem] shadow-[0_40px_120px_-80px_rgba(15,23,42,0.8)]"
          />
          <div className="absolute -bottom-6 -left-4 bg-white/90 border border-white/80 rounded-2xl px-5 py-4 shadow-xl float-slow">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Top rated</p>
            <p className="text-lg font-semibold text-slate-900">Studio Audio 2</p>
            <p className="text-sm text-slate-500">Now with adaptive sound</p>
          </div>
        </div>
        {activeHeroes.length > 1 && (
          <div className="lg:col-span-2 flex justify-center gap-2 pt-2">
            {activeHeroes.map((item, index) => (
              <button
                key={`${item.title || 'slide'}-${index}`}
                onClick={() => setHeroIndex(index)}
                className={`h-2 w-10 rounded-full transition ${index === heroIndex ? 'bg-sky-600' : 'bg-slate-200'}`}
                aria-label={`Go to hero slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>
      )}

      {!keyword && userInfo && userInfo.isAdmin && (
        <section className="fs-section reveal-on-scroll">
          <div className="fs-card p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <p className="fs-pill w-fit">Admin console</p>
                <h2 className="text-2xl font-black text-slate-900 mt-3">Store pulse</h2>
                <p className="text-slate-500">Quick snapshot of the catalog and stock health.</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link to="/admin/productlist" className="fs-button-primary px-5 py-2 text-sm">Manage products</Link>
                <Link to="/admin/orderlist" className="fs-button-ghost px-5 py-2 text-sm text-slate-700">Review orders</Link>
                <Link to="/admin/couponlist" className="fs-button-ghost px-5 py-2 text-sm text-slate-700">Coupons</Link>
                <Link to="/admin/homecontent" className="fs-button-ghost px-5 py-2 text-sm text-slate-700">Homepage</Link>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">Total products</p>
                <p className="text-2xl font-semibold text-slate-900">{adminStats.totalProducts}</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">Avg price</p>
                <p className="text-2xl font-semibold text-slate-900">₹{adminStats.avgPrice.toFixed(0)}</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">Low stock</p>
                <p className="text-2xl font-semibold text-amber-600">{adminStats.lowStock}</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">Top rated</p>
                <p className="text-2xl font-semibold text-emerald-600">{adminStats.topRated}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {!keyword && (
        <section id="collections" className="fs-section reveal-on-scroll">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <p className="fs-pill w-fit">Collections</p>
              <h2 className="text-3xl font-black text-slate-900">Shop by category</h2>
            </div>
            <p className="text-slate-500 max-w-md">
              Discover what is trending across essentials, tech, and travel.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCategories.map((item, index) => (
              <div key={item.title} className={`fs-card p-6 flex flex-col gap-4 reveal-on-scroll ${revealDirection(index)}`}>
                <div className="h-10 w-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                  <i className={item.icon}></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-slate-500 text-sm">{item.note}</p>
                </div>
                <button className="fs-button-ghost px-4 py-2 text-sm w-fit">Explore</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {!keyword && (
        <section className="fs-section reveal-on-scroll">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="fs-pill w-fit">Top deals</p>
              <h2 className="text-3xl font-black text-slate-900">Value picks</h2>
            </div>
            <span className="fs-tag">Limited time</span>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4">
            {deals.map((product, index) => (
              <div key={product._id} className={`min-w-[240px] fs-card p-4 flex flex-col gap-3 reveal-on-scroll ${revealDirection(index)}`}>
                <img
                  src={product.image || '/placeholder-product.svg'}
                  alt={product.name}
                  className="h-36 w-full object-cover rounded-xl"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                  <p className="text-xs text-slate-500">Starting at</p>
                  <p className="text-lg font-semibold text-sky-600">₹{product.price}</p>
                </div>
                <Link to={`/product/${product._id}`} className="fs-button-primary px-4 py-2 text-xs">View deal</Link>
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="latest" className="fs-section reveal-on-scroll">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h2 className="text-3xl font-black text-slate-900">
            {keyword ? `Search Results for "${keyword}"` : 'Latest Products'}
          </h2>
          <span className="fs-pill">Handpicked weekly</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl font-bold">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products && products.length > 0 ? (
              (keyword ? products : newArrivals).map((product, index) => (
                <div key={product._id} className={`reveal-on-scroll ${revealDirection(index)}`}>
                  <Product product={product} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <h2 className="text-xl font-bold text-slate-400 uppercase tracking-[0.2em]">
                  No Products Found
                </h2>
                <p className="text-slate-500 mt-2">Try searching for something else.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {!keyword && (
        <section className="fs-section reveal-on-scroll">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="fs-pill w-fit">Best sellers</p>
              <h2 className="text-3xl font-black text-slate-900">Most loved</h2>
            </div>
            <span className="fs-tag">Customer favorites</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestSellers.map((product, index) => (
              <div key={product._id} className={`reveal-on-scroll ${revealDirection(index)}`}>
                <Product product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {!keyword && categorySections.length > 0 && (
        <section className="fs-section">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <p className="fs-pill w-fit">Categories</p>
              <h2 className="text-3xl font-black text-slate-900">Shop by category</h2>
            </div>
            <p className="text-slate-500 max-w-md">
              Explore key categories with handpicked items.
            </p>
          </div>

          <div className="space-y-10">
            {categorySections.map((section, sectionIndex) => (
              <div key={section.category}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-slate-900">{section.category}</h3>
                  <span className="fs-tag">Top picks</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {section.items.map((product) => (
                    <Product key={product._id} product={product} />
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <Link
                    to={`/search/${encodeURIComponent(section.category)}`}
                    className="group inline-flex items-center gap-3 rounded-full border border-white/80 bg-white/90 px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white"
                  >
                    <span>Explore more</span>
                    <span className="arrow-slide text-sky-600">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomeScreen;