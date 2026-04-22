import React, { useEffect, useState } from 'react'; // 👈 Added useState
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { listProducts, deleteProduct, createProduct } from '../actions/productActions';
import { PRODUCT_CREATE_RESET } from '../constants/productConstants';

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

  const totalRevenue = products ? products.reduce((acc, item) => acc + item.price, 0) : 0;
  const totalProfit = totalRevenue * 0.20;

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

  const deleteHandler = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id));
    }
  };

  const createProductHandler = () => {
    dispatch(createProduct());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      
      {/* --- LIVE STATUS BAR --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 app-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          <span className="text-xs font-black uppercase tracking-widest text-foreground">System Live: Admin Dashboard</span>
        </div>
        <div className="text-right mt-2 md:mt-0">
          <span className="text-xs font-bold text-muted mr-4 italic">Profit calculated at:</span>
          <span className="font-mono font-black bg-surface-2 px-3 py-1 rounded-lg text-sm text-foreground">
            {formattedDate} | {formattedTime}
          </span>
        </div>
      </div>

      {/* --- DASHBOARD SUMMARY SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {/* Orders Card */}
        <div className="app-card p-6">
          <div className="flex justify-between items-start">
            <div className="bg-surface-2 p-3 rounded-2xl text-primary">
              <i className="fas fa-shopping-bag text-xl"></i>
            </div>
            <span className="text-[10px] font-black text-muted uppercase tracking-widest">Active Orders</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-foreground">{products ? products.length : 0}</h3>
            <p className="text-muted text-xs mt-1 font-medium">Sales this month</p>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="app-card p-6">
          <div className="flex justify-between items-start">
            <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
              <i className="fas fa-indian-rupee-sign text-xl"></i>
            </div>
            <span className="text-[10px] font-black text-muted uppercase tracking-widest">Total Revenue</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-foreground">₹{totalRevenue.toLocaleString()}</h3>
            <p className="text-muted text-xs mt-1 font-medium">Gross earnings</p>
          </div>
        </div>

        {/* Profit Card */}
        <div className="bg-foreground p-6 rounded-3xl shadow-app border border-app transition hover:scale-[1.02]">
          <div className="flex justify-between items-start">
            <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400">
              <i className="fas fa-chart-line text-xl"></i>
            </div>
            <span className="text-[10px] font-black text-muted uppercase tracking-widest">Net Profit</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-white">₹{totalProfit.toLocaleString()}</h3>
            <p className="text-emerald-400/60 text-xs mt-1 font-bold italic">20% Margin Applied</p>
          </div>
        </div>

        {/* Inventory Card */}
        <div className="app-card p-6">
          <div className="flex justify-between items-start">
            <div className="bg-orange-50 p-3 rounded-2xl text-orange-600">
              <i className="fas fa-boxes-stacked text-xl"></i>
            </div>
            <span className="text-[10px] font-black text-muted uppercase tracking-widest">Stock Level</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-foreground">{products ? products.length : 0} Items</h3>
            <p className="text-muted text-xs mt-1 font-medium">Live in Store</p>
          </div>
        </div>
      </div>

      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">
            Product <span className="text-primary">Inventory</span>
          </h1>
          <p className="text-muted text-sm font-medium">Manage your store products and pricing</p>
        </div>

        <button
          onClick={createProductHandler}
          className="app-btn px-8 py-4 rounded-full text-xs tracking-widest uppercase flex items-center gap-3 shadow-app active:scale-95"
        >
          <i className="fas fa-plus text-[10px]"></i>
          <span>Create New Product</span>
        </button>
      </div>

      {loadingDelete && <div className="text-primary font-bold mb-4 animate-pulse italic">Processing Delete...</div>}
      
      {/* --- TABLE SECTION --- */}
      <div className="app-card rounded-[2rem] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-2 border-b border-app">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-[0.2em]">ID</th>
              <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-[0.2em]">Name</th>
              <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-[0.2em]">Price</th>
              <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-[0.2em]">Category</th>
              <th className="px-8 py-5 text-center text-[10px] font-black text-muted uppercase tracking-[0.2em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--border)]">
            {products && products.map((product) => (
              <tr key={product._id} className="hover:bg-surface-2/60 transition-colors group">
                <td className="px-8 py-5 text-xs font-mono text-muted">{product._id.substring(0, 8)}</td>
                <td className="px-8 py-5 text-sm font-bold text-foreground">{product.name}</td>
                <td className="px-8 py-5 text-sm font-black text-primary">₹{product.price.toLocaleString()}</td>
                <td className="px-8 py-5 text-xs font-bold text-muted uppercase tracking-widest">{product.category}</td>
                <td className="px-8 py-5 text-center">
                  <div className="flex justify-center gap-3">
                    <Link 
                      to={`/admin/product/${product._id}/edit`}
                      className="bg-surface-2 text-foreground px-5 py-2 rounded-xl text-[10px] font-black tracking-widest hover:bg-foreground hover:text-white transition-all shadow-sm"
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