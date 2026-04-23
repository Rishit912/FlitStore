import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'; // 🟢 Needed to grab the search keyword
import Product from '../components/Product';
import { listProducts } from '../actions/productActions'; // Ensure this action exists
import axios from 'axios';

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.products)) return value.products;
  return [];
};

const HomeScreen = () => {
  const { keyword } = useParams(); // 🟢 Extracts the keyword from the URL
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [banner, setBanner] = useState({
    badgeText: 'New Season Drops',
    title: 'Shop Smarter.',
    highlight: 'Feel the Future.',
    subtitle: 'A unique, high‑end shopping experience with curated products, AI‑assisted deals, and lightning‑fast checkout.',
    ctaText: 'Explore Collection',
    ctaLink: '/',
    promoText: 'Free shipping on orders over ₹1000',
    image: '',
    backgroundColor: '',
    textColor: '',
    accentColor: '',
    badgeBgColor: '',
    promoBgColor: '',
    backgroundImage: '',
    animation: 'none',
    decorImages: [],
  });
  const { search } = useLocation();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const searchFilters = useMemo(() => {
    const params = new URLSearchParams(search);
    const minPrice = Number(params.get('minPrice') || 0);
    const maxPrice = Number(params.get('maxPrice') || 0);
    return {
      category: params.get('category') || 'All',
      brand: params.get('brand') || 'All',
      minPrice,
      maxPrice,
      minRating: params.get('minRating') || '',
      sort: params.get('sort') || 'newest',
      priceApplied: Boolean(minPrice || maxPrice),
    };
  }, [search]);

  // Pulling state from Redux instead of local useState
  const productList = useSelector((state) => state.productList);
  const { loading, error, products } = productList;
  const safeProducts = useMemo(() => toArray(products), [products]);

  useEffect(() => {
    // Every time the keyword or category changes, we re-fetch
    const categoryFilter = searchFilters.category !== 'All' ? searchFilters.category : '';
    const brandFilter = searchFilters.brand !== 'All' ? searchFilters.brand : '';
    dispatch(listProducts({
      keyword,
      category: categoryFilter,
      brand: brandFilter,
      minPrice: searchFilters.priceApplied && searchFilters.minPrice > 0 ? searchFilters.minPrice : '',
      maxPrice: searchFilters.priceApplied && searchFilters.maxPrice > 0 ? searchFilters.maxPrice : '',
      minRating: searchFilters.minRating || '',
      sort: searchFilters.sort,
    }));
  }, [dispatch, keyword, searchFilters]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('/api/products/categories');
        setCategories(toArray(data));
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data } = await axios.get('/api/products/brands');
        setBrands(toArray(data));
      } catch {
        setBrands([]);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const { data } = await axios.get('/api/banner');
        if (data) {
          setBanner((prev) => ({
            ...prev,
            ...data,
          }));
        }
      } catch {
        // Keep fallback banner on failure
      }
    };
    fetchBanner();
  }, []);

  useEffect(() => {
    const fetchHomeSections = async () => {
      try {
        const [newArrivalsRes, bestSellersRes] = await Promise.all([
          axios.get('/api/products?sort=newest'),
          axios.get('/api/products/best-sellers?limit=8'),
        ]);

        setNewArrivals(toArray(newArrivalsRes.data).slice(0, 8));
        setBestSellers(toArray(bestSellersRes.data).slice(0, 8));
      } catch {
        setNewArrivals([]);
        setBestSellers([]);
      }
    };

    fetchHomeSections();
  }, []);

  const priceBounds = useMemo(() => {
    if (!safeProducts.length) return { min: 0, max: 0 };
    const prices = safeProducts.map((p) => Number(p.price)).filter((n) => !Number.isNaN(n));
    if (!prices.length) return { min: 0, max: 0 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [safeProducts]);

  const categoryList = useMemo(() => {
    const fallback = ['Men', 'Women', 'Electronics', 'Accessories'];
    return categories.length ? categories : fallback;
  }, [categories]);

  const updateFilters = (next) => {
    const params = new URLSearchParams();
    const cat = next.category ?? searchFilters.category;
    const brand = next.brand ?? searchFilters.brand;
    const minP = next.minPrice ?? searchFilters.minPrice;
    const maxP = next.maxPrice ?? searchFilters.maxPrice;
    const rating = next.minRating ?? searchFilters.minRating;
    const sortBy = next.sort ?? searchFilters.sort;
    const priceOn = next.priceApplied ?? searchFilters.priceApplied;

    if (cat && cat !== 'All') params.set('category', cat);
    if (brand && brand !== 'All') params.set('brand', brand);
    if (priceOn && minP && Number(minP) > 0) params.set('minPrice', minP);
    if (priceOn && maxP && Number(maxP) > 0) params.set('maxPrice', maxP);
    if (rating) params.set('minRating', rating);
    if (sortBy && sortBy !== 'newest') params.set('sort', sortBy);

    const qs = params.toString();
    const base = keyword ? `/search/${keyword}` : '/';
    navigate(qs ? `${base}?${qs}` : base);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <section
        className={`app-card glow-border p-8 md:p-12 mb-12 shimmer animate-fade-up hero-anim-${banner.animation || 'none'} 
          ${!banner.backgroundColor && !banner.backgroundImage ? 'bg-gradient-to-br from-white via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900' : ''}
          ${!banner.textColor ? 'text-gray-900 dark:text-white' : ''}`}
        style={{
          backgroundColor: banner.backgroundColor || undefined,
          backgroundImage: banner.backgroundImage ? `url(${banner.backgroundImage})` : undefined,
          backgroundSize: banner.backgroundImage ? 'cover' : undefined,
          backgroundPosition: banner.backgroundImage ? 'center' : undefined,
          color: banner.textColor || undefined,
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary glass-badge px-3 py-1 rounded-full">
              <span
                className="px-3 py-1 rounded-full"
                style={{
                  background: banner.badgeBgColor || undefined,
                  color: banner.textColor || undefined,
                }}
              >
                {banner.badgeText}
              </span>
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-foreground leading-tight">
              <span style={{ color: banner.textColor || undefined }}>{banner.title}</span>{' '}
              <span className="text-primary" style={{ color: banner.accentColor || undefined }}>
                {banner.highlight}
              </span>
            </h1>
            <p className="text-muted max-w-xl" style={{ color: banner.textColor || undefined }}>
              {banner.subtitle}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link className="app-btn px-6 py-3" to={banner.ctaLink || '/'}>
                {banner.ctaText}
              </Link>
              <span
                className="text-xs font-bold text-muted glass-badge px-3 py-2 rounded-full"
                style={{
                  background: banner.promoBgColor || undefined,
                  color: banner.textColor || undefined,
                }}
              >
                {banner.promoText}
              </span>
            </div>
          </div>
          {banner.image ? (
            <div className="w-full md:w-80 lg:w-96">
              <div className="app-card p-3">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-64 object-cover rounded-2xl"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="app-card p-4 animate-float">
                <div className="text-xs text-muted uppercase font-black">Deals</div>
                <div className="text-2xl font-black text-foreground">Up to 40%</div>
                <div className="text-xs text-muted">Exclusive launches</div>
              </div>
              <div className="app-card p-4 animate-float" style={{ animationDelay: '0.6s' }}>
                <div className="text-xs text-muted uppercase font-black">Ratings</div>
                <div className="text-2xl font-black text-foreground">4.9/5</div>
                <div className="text-xs text-muted">Verified buyers</div>
              </div>
            </div>
          )}
        </div>

        {Array.isArray(banner.decorImages) && banner.decorImages.length > 0 && (
          <div className="pointer-events-none">
            {banner.decorImages.slice(0, 4).map((img, idx) => (
              <img
                key={`${img}-${idx}`}
                src={img}
                alt="festival-decor"
                className={`absolute opacity-80 hero-decor hero-decor-${idx}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 🟢 FEATURE SHOWCASE: AR & AI Haggling */}
      <section className="mb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AR Try-On Feature */}
          <div className="app-card p-8 md:p-10 border-2 border-primary/20 relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/5 rounded-full group-hover:scale-110 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-2xl font-black text-foreground mb-2">Try Products in AR</h3>
              <p className="text-muted leading-relaxed mb-6">
                Use your phone's camera to virtually try on clothing and see how products look on you before buying. See products in your real space with augmented reality technology.
              </p>
              <div className="flex items-center gap-2 text-sm font-bold text-primary">
                <span>Coming Soon on Product Pages</span>
                <span>→</span>
              </div>
            </div>
          </div>

          {/* AI Haggling Feature */}
          <div className="app-card p-8 md:p-10 border-2 border-accent-1/20 relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-accent-1/5 rounded-full group-hover:scale-110 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-1/10 mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-2xl font-black text-foreground mb-2">Haggle with AI</h3>
              <p className="text-muted leading-relaxed mb-6">
                Smart negotiation powered by AI. Make a reasonable offer on any product and our intelligent system will negotiate with you. Get deals up to 10% off marked prices.
              </p>
              <div className="flex items-center gap-2 text-sm font-bold text-accent-1">
                <span>Available on all products</span>
                <span>→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Home Collections */}
      <section className="space-y-10 mb-12">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-2">Fresh Picks</p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">New Arrivals</h2>
          </div>
          <p className="text-sm text-muted max-w-xl">
            Latest products added by admins and retailers. These are the newest items in the store.
          </p>
        </div>
        {newArrivals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
            {newArrivals.map((product) => (
              <Product key={`new-${product._id}`} product={product} />
            ))}
          </div>
        ) : (
          <div className="app-card p-6 text-muted">No new arrivals yet.</div>
        )}
      </section>

      <section className="space-y-10 mb-14">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-2">Top Rated</p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Best Sellers</h2>
          </div>
          <p className="text-sm text-muted max-w-xl">
            Products with the highest real sales and strong customer feedback rise to this section.
          </p>
        </div>
        {bestSellers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
            {bestSellers.map((product) => (
              <Product key={`best-${product._id}`} product={product} />
            ))}
          </div>
        ) : (
          <div className="app-card p-6 text-muted">No best sellers available yet.</div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="app-card p-5">
            <div className="text-sm font-black text-foreground uppercase mb-3">Categories</div>
            <ul className="space-y-2">
              <li>
                <button
                  className={`w-full text-left text-sm font-semibold ${searchFilters.category === 'All' ? 'text-primary' : 'text-muted'}`}
                  onClick={() => {
                    updateFilters({ category: 'All' });
                  }}
                >
                  All Categories
                </button>
              </li>
              {categoryList.map((c) => (
                <li key={c}>
                  <button
                    className={`w-full text-left text-sm font-semibold ${searchFilters.category === c ? 'text-primary' : 'text-muted'}`}
                    onClick={() => {
                      updateFilters({ category: c });
                    }}
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="app-card p-5">
            <div className="text-sm font-black text-foreground uppercase mb-3">Brand</div>
            <select
              value={searchFilters.brand}
              onChange={(e) => {
                updateFilters({ brand: e.target.value });
              }}
              className="w-full app-input"
            >
              <option value="All">All Brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="app-card p-5">
            <div className="text-sm font-black text-foreground uppercase mb-3">Price</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-muted">
                <span>₹{searchFilters.minPrice || priceBounds.min}</span>
                <span>₹{searchFilters.maxPrice || priceBounds.max}</span>
              </div>
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                step={Math.max(1, Math.floor((priceBounds.max - priceBounds.min) / 20))}
                value={searchFilters.minPrice || priceBounds.min}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  updateFilters({ minPrice: val > (searchFilters.maxPrice || priceBounds.max) ? (searchFilters.maxPrice || priceBounds.max) : val });
                }}
                className="w-full"
              />
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                step={Math.max(1, Math.floor((priceBounds.max - priceBounds.min) / 20))}
                value={searchFilters.maxPrice || priceBounds.max}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  updateFilters({ maxPrice: val < (searchFilters.minPrice || priceBounds.min) ? (searchFilters.minPrice || priceBounds.min) : val });
                }}
                className="w-full"
              />
                <button
                  className="app-btn w-full"
                  onClick={() => {
                    updateFilters({ minPrice: searchFilters.minPrice, maxPrice: searchFilters.maxPrice, priceApplied: true });
                  }}
                >
                  Apply Price
                </button>
            </div>
          </div>

          <div className="app-card p-5">
            <div className="text-sm font-black text-foreground uppercase mb-3">Rating</div>
            <select
              value={searchFilters.minRating}
              onChange={(e) => {
                updateFilters({ minRating: e.target.value });
              }}
              className="w-full app-input"
            >
              <option value="">All Ratings</option>
              <option value="4">4★ & up</option>
              <option value="3">3★ & up</option>
              <option value="2">2★ & up</option>
              <option value="1">1★ & up</option>
            </select>
          </div>

          <button
            className="app-btn w-full"
            onClick={() => {
              updateFilters({ category: 'All', brand: 'All', minPrice: '', maxPrice: '', minRating: '', sort: 'newest', priceApplied: false });
            }}
          >
            Clear All
          </button>
        </aside>

        {/* Right Content */}
        <section className="lg:col-span-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
            <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">
              {keyword ? `Search Results for "${keyword}"` : 'Latest Products'}
            </h2>
            <div className="flex items-center gap-3">
              <label className="text-xs font-black text-muted uppercase tracking-widest">Sort By</label>
              <select
                value={searchFilters.sort}
                onChange={(e) => {
                  updateFilters({ sort: e.target.value });
                }}
                className="app-input"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Top Rated</option>
              </select>
            </div>
          </div>

          {(keyword || searchFilters.category !== 'All' || searchFilters.brand !== 'All' || searchFilters.minRating || searchFilters.priceApplied) && (
            <div className="app-card p-4 mb-6 flex flex-wrap items-center gap-3">
              <span className="text-xs font-black text-muted uppercase">Active Filters:</span>
              {keyword && (
                <span className="text-xs font-bold text-foreground glass-badge px-2 py-1 rounded-full">
                  Search: {keyword}
                </span>
              )}
              {searchFilters.category !== 'All' && (
                <span className="text-xs font-bold text-foreground glass-badge px-2 py-1 rounded-full">
                  Category: {searchFilters.category}
                </span>
              )}
              {searchFilters.brand !== 'All' && (
                <span className="text-xs font-bold text-foreground glass-badge px-2 py-1 rounded-full">
                  Brand: {searchFilters.brand}
                </span>
              )}
              {searchFilters.priceApplied && (
                <span className="text-xs font-bold text-foreground glass-badge px-2 py-1 rounded-full">
                  Price: ₹{searchFilters.minPrice || priceBounds.min} - ₹{searchFilters.maxPrice || priceBounds.max}
                </span>
              )}
              {searchFilters.minRating && (
                <span className="text-xs font-bold text-foreground glass-badge px-2 py-1 rounded-full">
                  Rating: {searchFilters.minRating}★ & up
                </span>
              )}
              {keyword && (
                <button
                  className="text-xs font-bold text-primary"
                  onClick={() => navigate('/')}
                >
                  Clear Search
                </button>
              )}
              <button
                className="text-xs font-bold text-primary"
                onClick={() => {
                  updateFilters({ category: 'All', brand: 'All', minPrice: '', maxPrice: '', minRating: '', sort: 'newest', priceApplied: false });
                }}
              >
                Clear Filters
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[color:var(--primary)]"></div>
            </div>
          ) : error ? (
            <div className="app-card p-4 text-red-500 font-bold">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 animate-fade-in">
              {safeProducts.length > 0 ? (
                safeProducts.map((product) => (
                  <Product key={product._id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-20">
                  <h2 className="text-xl font-bold text-muted uppercase tracking-widest">
                    No Products Found
                  </h2>
                  <p className="text-muted mt-2">Try clearing filters or search.</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-3">
                    <button
                      className="app-btn px-4 py-2"
                      onClick={() => {
                        updateFilters({ category: 'All', brand: 'All', minPrice: '', maxPrice: '', minRating: '', sort: 'newest', priceApplied: false });
                      }}
                    >
                      Clear Filters
                    </button>
                    {keyword && (
                      <button className="app-btn px-4 py-2" onClick={() => navigate('/')}>Clear Search</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomeScreen;