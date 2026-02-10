import React, { useEffect, useMemo, useState } from 'react'; // 👈 Added useState
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { listProducts, deleteProduct, createProduct } from '../actions/productActions';
import { PRODUCT_CREATE_RESET } from '../constants/productConstants';
import { getHomeConfig, setHomeConfig as persistHomeConfig, resetHomeConfig } from '../utils/homeConfig';

const ProductListScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // --- REAL-TIME CLOCK LOGIC ---
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer); // Cleanup on unmount
  }, []);

  const formattedDate = time.toLocaleDateString('en-IN', { 
    day: 'numeric', month: 'long', year: 'numeric' 
  });
  const formattedTime = time.toLocaleTimeString('en-IN', { 
    hour: '2-digit', minute: '2-digit', second: '2-digit' 
  });

  const productList = useSelector((state) => state.productList);
  const { loading, error, products } = productList;

  const productDelete = useSelector((state) => state.productDelete);
  const { loading: loadingDelete, error: errorDelete, success: successDelete } = productDelete;

  const productCreate = useSelector((state) => state.productCreate);
  const { loading: loadingCreate, error: errorCreate, success: successCreate, product: createdProduct } = productCreate;

  const { userInfo } = useSelector((state) => state.auth);

  const [homeConfigState, setHomeConfigState] = useState(getHomeConfig());
  const [lowStock, setLowStock] = useState([]);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);

  const totalRevenue = products ? products.reduce((acc, item) => acc + item.price, 0) : 0;
  const totalProfit = totalRevenue * 0.20;

  const availableCategories = useMemo(() => {
    if (!products) return [];
    const list = products.map((item) => item.category).filter(Boolean);
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
  }, [products]);

  useEffect(() => {
    dispatch({ type: PRODUCT_CREATE_RESET });

    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login');
    }

    if (successCreate) {
      toast.success('Product Created Successfully!');
      navigate(`/admin/product/${createdProduct._id}/edit`);
    } else {
      dispatch(listProducts());
    }

    if (successDelete) {
      toast.info('Product Deleted');
    }
  }, [dispatch, navigate, userInfo, successDelete, successCreate, createdProduct]);

  useEffect(() => {
    const fetchLowStock = async () => {
      if (!userInfo || !userInfo.isAdmin) return;

      try {
        const { data } = await axios.get(`/api/products/low-stock?threshold=${lowStockThreshold}&limit=10`);
        setLowStock(data || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load low stock items');
      }
    };

    fetchLowStock();
  }, [userInfo, lowStockThreshold]);

  const deleteHandler = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id));
    }
  };

  const createProductHandler = () => {
    dispatch(createProduct());
  };

  const updateHomeConfig = (field, value) => {
    setHomeConfigState((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (category) => {
    setHomeConfigState((prev) => {
      const exists = prev.featuredCategories.includes(category);
      const next = exists
        ? prev.featuredCategories.filter((item) => item !== category)
        : [...prev.featuredCategories, category];
      return { ...prev, featuredCategories: next.slice(0, 4) };
    });
  };

  const saveHomeConfig = () => {
    persistHomeConfig(homeConfigState);
    window.dispatchEvent(new Event('flitHomeConfigUpdated'));
    toast.success('Homepage sections updated');
  };

  const resetHomeConfigState = () => {
    resetHomeConfig();
    setHomeConfigState(getHomeConfig());
    window.dispatchEvent(new Event('flitHomeConfigUpdated'));
    toast.info('Homepage sections reset');
  };

  return (
    <div className="fs-container fs-section">
      
      {/* --- LIVE STATUS BAR --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-slate-900 p-4 rounded-2xl shadow-lg text-white">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          <span className="text-xs font-black uppercase tracking-widest">System Live: Admin Dashboard</span>
        </div>
        <div className="text-right mt-2 md:mt-0">
          <span className="text-xs font-bold opacity-80 mr-4 italic">Profit calculated at:</span>
          <span className="font-mono font-black bg-slate-800 px-3 py-1 rounded-lg text-sm">
            {formattedDate} | {formattedTime}
          </span>
        </div>
      </div>

      {/* --- DASHBOARD SUMMARY SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {/* Orders Card */}
        <div className="fs-card p-6 rounded-3xl">
          <div className="flex justify-between items-start">
            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
              <i className="fas fa-shopping-bag text-xl"></i>
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Orders</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-gray-900">{products ? products.length : 0}</h3>
            <p className="text-gray-400 text-xs mt-1 font-medium">Sales this month</p>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="fs-card p-6 rounded-3xl">
          <div className="flex justify-between items-start">
            <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
              <i className="fas fa-indian-rupee-sign text-xl"></i>
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Revenue</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-gray-900">₹{totalRevenue.toLocaleString()}</h3>
            <p className="text-gray-400 text-xs mt-1 font-medium">Gross earnings</p>
          </div>
        </div>

        {/* Profit Card */}
        <div className="bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-800 transition hover:scale-[1.02]">
          <div className="flex justify-between items-start">
            <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400">
              <i className="fas fa-chart-line text-xl"></i>
            </div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Net Profit</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-white">₹{totalProfit.toLocaleString()}</h3>
            <p className="text-emerald-400/60 text-xs mt-1 font-bold italic">20% Margin Applied</p>
          </div>
        </div>

        {/* Inventory Card */}
        <div className="fs-card p-6 rounded-3xl">
          <div className="flex justify-between items-start">
            <div className="bg-orange-50 p-3 rounded-2xl text-orange-600">
              <i className="fas fa-boxes-stacked text-xl"></i>
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Level</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-gray-900">{products ? products.length : 0} Items</h3>
            <p className="text-gray-400 text-xs mt-1 font-medium">Live in Store</p>
          </div>
        </div>
      </div>

      <div className="fs-card p-6 rounded-3xl mb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="fs-pill w-fit">Inventory alerts</p>
            <h2 className="text-2xl font-black text-slate-900 mt-3">Low stock items</h2>
            <p className="text-slate-500">Products at or below the threshold need replenishment.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Threshold</label>
            <input
              type="number"
              min="1"
              max="100"
              className="fs-input w-24"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(Number(e.target.value) || 1)}
            />
          </div>
        </div>

        {lowStock.length === 0 ? (
          <div className="mt-6 text-slate-400">No low stock items found.</div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {lowStock.map((item) => (
              <div key={item._id} className="rounded-2xl border border-white/70 bg-white/80 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <span className="text-xs font-semibold text-rose-600">Stock: {item.countInStock}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Category: {item.category}</p>
                <div className="mt-3">
                  <Link
                    to={`/admin/product/${item._id}/edit`}
                    className="text-sky-700 text-xs font-semibold hover:underline"
                  >
                    Update inventory
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
            Product <span className="text-sky-600">Inventory</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium">Manage your store products and pricing</p>
        </div>

        <button
          onClick={createProductHandler}
          className="bg-slate-900 text-white px-8 py-4 rounded-full font-black text-xs tracking-widest uppercase flex items-center gap-3 hover:bg-sky-600 transition-all duration-300 shadow-xl active:scale-95"
        >
          <i className="fas fa-plus text-[10px]"></i>
          <span>Create New Product</span>
        </button>
      </div>

      <div className="fs-card p-6 rounded-3xl mb-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="fs-pill w-fit">Homepage control</p>
            <h2 className="text-2xl font-black text-slate-900 mt-3">Sections and categories</h2>
            <p className="text-slate-500">Configure what shows on the homepage for shoppers.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => dispatch(listProducts())}
              className="fs-button-ghost px-5 py-2 text-sm text-slate-700"
            >
              Refresh categories
            </button>
            <button onClick={saveHomeConfig} className="fs-button-primary px-5 py-2 text-sm">Save homepage</button>
            <button onClick={resetHomeConfigState} className="fs-button-ghost px-5 py-2 text-sm text-slate-700">Reset</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="rounded-2xl border border-white/70 bg-white/80 p-4 space-y-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">Top deals</p>
            <select
              className="fs-input"
              value={homeConfigState.dealsSort}
              onChange={(e) => updateHomeConfig('dealsSort', e.target.value)}
            >
              <option value="price-asc">Lowest price</option>
              <option value="price-desc">Highest price</option>
              <option value="rating-desc">Highest rating</option>
            </select>
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/80 p-4 space-y-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">Most loved</p>
            <select
              className="fs-input"
              value={homeConfigState.bestSort}
              onChange={(e) => updateHomeConfig('bestSort', e.target.value)}
            >
              <option value="reviews-desc">Most reviews</option>
              <option value="rating-desc">Highest rating</option>
              <option value="price-desc">Highest price</option>
            </select>
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/80 p-4 space-y-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">New arrivals</p>
            <select
              className="fs-input"
              value={homeConfigState.newSort}
              onChange={(e) => updateHomeConfig('newSort', e.target.value)}
            >
              <option value="created-desc">Newest first</option>
              <option value="created-asc">Oldest first</option>
              <option value="price-desc">Highest price</option>
            </select>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/70 bg-white/80 p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold mb-3">Featured categories (pick up to 4)</p>
          {availableCategories.length === 0 ? (
            <p className="text-sm text-slate-500">No categories found yet. Add categories to products.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {availableCategories.map((category) => (
                <label key={category} className="flex items-center gap-2 text-sm text-slate-700 bg-white/90 border border-white/80 px-3 py-2 rounded-full">
                  <input
                    type="checkbox"
                    checked={homeConfigState.featuredCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="h-4 w-4 text-sky-600"
                  />
                  {category}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {loadingDelete && <div className="text-blue-500 font-bold mb-4 animate-pulse italic">Processing Delete...</div>}
      
      {/* --- TABLE SECTION --- */}
      <div className="fs-card rounded-[2rem] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white/80 border-b border-slate-200">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">ID</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Name</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Price</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Category</th>
              <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products && products.map((product) => (
              <tr key={product._id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-8 py-5 text-xs font-mono text-gray-400">{product._id.substring(0, 8)}</td>
                <td className="px-8 py-5 text-sm font-bold text-gray-900">{product.name}</td>
                <td className="px-8 py-5 text-sm font-black text-blue-600">₹{product.price.toLocaleString()}</td>
                <td className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">{product.category}</td>
                <td className="px-8 py-5 text-center">
                  <div className="flex justify-center gap-3">
                    <Link 
                      to={`/admin/product/${product._id}/edit`}
                      className="bg-gray-100 text-gray-900 px-5 py-2 rounded-xl text-[10px] font-black tracking-widest hover:bg-black hover:text-white transition-all shadow-sm"
                    >
                      EDIT
                    </Link>
                    <button 
                      onClick={() => deleteHandler(product._id)}
                      className="bg-red-50 text-red-600 px-5 py-2 rounded-xl text-[10px] font-black tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    >
                      DELETE
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductListScreen;