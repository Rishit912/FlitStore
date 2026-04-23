import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import RetailerProductForm from '../components/RetailerProductForm';
import RetailerProductList from '../components/RetailerProductList';

const SIDEBAR_LINKS = [
  { key: 'overview', label: 'Overview' },
  { key: 'products', label: 'Products' },
  { key: 'orders', label: 'Orders' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'reviews', label: 'Reviews' },
];

const RetailerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [summary, setSummary] = useState({ totalProducts: 0, totalUnitsSold: 0, totalRevenue: 0, totalOrders: 0 });
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [updatingFulfillmentId, setUpdatingFulfillmentId] = useState('');

  const getRetailerFulfillmentStatus = (order) => {
    const statuses = (order.orderItems || []).map((item) => item.fulfillmentStatus || 'pending');
    if (statuses.length === 0) return 'pending';
    if (statuses.every((status) => status === 'delivered')) return 'delivered';
    if (statuses.some((status) => status === 'out_for_delivery')) return 'out_for_delivery';
    if (statuses.some((status) => status === 'shipped')) return 'shipped';
    if (statuses.some((status) => status === 'packed')) return 'packed';
    return 'pending';
  };

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryRes, productsRes] = await Promise.all([
          axios.get('/api/products/retailer/summary'),
          axios.get('/api/products/my-products'),
        ]);

        setSummary(summaryRes.data || { totalProducts: 0, totalUnitsSold: 0, totalRevenue: 0, totalOrders: 0 });
        setProducts(productsRes.data || []);
      } catch {
        setSummary({ totalProducts: 0, totalUnitsSold: 0, totalRevenue: 0, totalOrders: 0 });
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders') {
      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          const { data } = await axios.get('/api/orders/retailer/orders');
          setOrders(data || []);
        } catch (err) {
          console.error('Error fetching orders:', err);
          setOrders([]);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [activeTab]);

  // Fetch reviews when reviews tab is active
  useEffect(() => {
    if (activeTab === 'reviews') {
      const fetchReviews = async () => {
        setLoadingReviews(true);
        try {
          const { data } = await axios.get('/api/orders/retailer/reviews');
          setReviews(data || []);
        } catch (err) {
          console.error('Error fetching reviews:', err);
          setReviews([]);
        } finally {
          setLoadingReviews(false);
        }
      };
      fetchReviews();
    }
  }, [activeTab]);

  // Fetch analytics when analytics tab is active
  useEffect(() => {
    if (activeTab === 'analytics') {
      const fetchAnalytics = async () => {
        setLoadingAnalytics(true);
        try {
          const { data } = await axios.get('/api/orders/retailer/analytics');
          setAnalytics(data || {});
        } catch (err) {
          console.error('Error fetching analytics:', err);
          setAnalytics({});
        } finally {
          setLoadingAnalytics(false);
        }
      };
      fetchAnalytics();
    }
  }, [activeTab]);

  const overviewCards = useMemo(() => ([
    {
      label: 'Products',
      value: summary.totalProducts || products.length,
      accent: 'from-sky-100 to-sky-200',
      text: 'text-sky-900',
      valueText: 'text-sky-700',
    },
    {
      label: 'Units Sold',
      value: summary.totalUnitsSold || 0,
      accent: 'from-emerald-100 to-emerald-200',
      text: 'text-emerald-900',
      valueText: 'text-emerald-700',
    },
    {
      label: 'Revenue',
      value: `₹${summary.totalRevenue || 0}`,
      accent: 'from-amber-100 to-amber-200',
      text: 'text-amber-900',
      valueText: 'text-amber-700',
    },
    {
      label: 'Orders',
      value: summary.totalOrders || 0,
      accent: 'from-rose-100 to-rose-200',
      text: 'text-rose-900',
      valueText: 'text-rose-700',
    },
  ]), [products.length, summary]);

  const handleProductSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        price: Number(data.price),
        description: data.description,
        brand: data.brand,
        category: data.category,
        size: data.size || '',
        countInStock: Number(data.countInStock || 0),
        image: data.image || '/default-product.png',
      };

      if (editing) {
        const { data: updatedProduct } = await axios.put(`/api/products/my-products/${editing._id}`, payload);
        setProducts((current) => current.map((product) => (product._id === editing._id ? updatedProduct : product)));
      } else {
        const { data: createdProduct } = await axios.post('/api/products/my-products', payload);
        setProducts((current) => [createdProduct, ...current]);
      }

      const { data: refreshedSummary } = await axios.get('/api/products/retailer/summary');
      setSummary(refreshedSummary || summary);
      setEditing(null);
      setActiveTab('products');
      toast.success(editing ? 'Product updated' : 'Product created');
    } catch {
      toast.error('Unable to save product right now');
      // keep current state if save fails; the backend will surface the error in the UI later if needed
    }
  };

  const handleProductDelete = async (productId) => {
    if (!window.confirm('Delete this product?')) return;

    try {
      await axios.delete(`/api/products/my-products/${productId}`);
      setProducts((current) => current.filter((product) => product._id !== productId));
      const { data: refreshedSummary } = await axios.get('/api/products/retailer/summary');
      setSummary(refreshedSummary || summary);
      toast.success('Product deleted');
    } catch {
      toast.error('Unable to delete product');
    }
  };

  const handleFulfillmentUpdate = async (orderId, status) => {
    try {
      setUpdatingFulfillmentId(orderId);
      const { data } = await axios.put(`/api/orders/${orderId}/fulfillment`, { status });
      const filteredItems = (data.orderItems || []).filter((item) =>
        products.some((product) => String(product._id) === String(item.product))
      );
      const retailerAmount = filteredItems.reduce((acc, item) => acc + Number(item.price) * Number(item.qty), 0);
      setOrders((current) => current.map((order) => (
        order._id === orderId
          ? { ...data, orderItems: filteredItems, retailerAmount: Number(retailerAmount.toFixed(2)) }
          : order
      )));
      toast.success(`Order updated: ${status.replaceAll('_', ' ')}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to update fulfillment');
    } finally {
      setUpdatingFulfillmentId('');
    }
  };

  return (
    <div className="min-h-[80vh] rounded-[2rem] overflow-hidden bg-app shadow-2xl border border-app">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="lg:w-72 bg-[#0b1220] text-white p-6 lg:p-8 border-r border-white/10">
          <div className="mb-8">
            <p className="text-[11px] uppercase tracking-[0.38em] text-orange-300 mb-2 font-black">Merchant Console</p>
            <h2 className="text-3xl font-black tracking-tight text-white">Retailer</h2>
            <p className="mt-3 text-sm text-slate-300 leading-6">
              Manage your catalog, monitor sales, and keep your storefront polished.
            </p>
          </div>

          <div className="space-y-2">
            {SIDEBAR_LINKS.map((link) => (
              <button
                key={link.key}
                className={`w-full text-left px-4 py-3 rounded-2xl font-semibold transition-all border ${activeTab === link.key ? 'bg-surface text-foreground border-primary shadow-lg' : 'text-muted border-transparent hover:bg-surface-2 hover:text-foreground'}`}
                onClick={() => setActiveTab(link.key)}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-2xl bg-surface-2 border border-app p-4 backdrop-blur-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted">Store Status</p>
            <p className="mt-2 text-sm text-foreground font-medium">Active and ready to sell</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-5 sm:p-8 lg:p-10">
          <div className="mb-8 rounded-[2rem] bg-surface backdrop-blur border border-app shadow-xl p-6 lg:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.38em] text-primary font-black mb-2">Dashboard</p>
                <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight">Your Retailer Workspace</h1>
                <p className="mt-3 text-sm lg:text-base text-muted max-w-2xl leading-7">
                  Track store performance, manage your product catalog, and keep your seller tools separate from platform-wide admin controls.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-2xl bg-surface-2 text-foreground px-4 py-3 min-w-28 shadow-lg border border-app">
                  <div className="text-[11px] uppercase tracking-[0.25em] text-muted font-black">Products</div>
                  <div className="text-2xl font-black mt-1 tabular-nums">{summary.totalProducts || products.length}</div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-fuchsia-500 text-white px-4 py-3 min-w-28 shadow-lg">
                  <div className="text-[11px] uppercase tracking-[0.25em] text-white/70 font-black">Revenue</div>
                  <div className="text-2xl font-black mt-1 tabular-nums">₹{summary.totalRevenue || 0}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 rounded-2xl border border-primary/30 bg-primary/10 p-4 lg:p-5">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">New Seller Features</p>
            <p className="mt-2 text-sm text-foreground">
              Use <span className="font-bold">Orders</span> to update fulfillment and <span className="font-bold">Reviews</span> to read buyer feedback.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className="app-btn px-4 py-2 text-xs font-bold"
              >
                Open Orders
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className="border border-app bg-surface-2 text-foreground px-4 py-2 rounded-lg text-xs font-bold"
              >
                Open Reviews
              </button>
            </div>
          </div>

          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                {overviewCards.map((card) => (
                  <div key={card.label} className="rounded-[1.75rem] bg-surface border border-app shadow-lg p-6 hover-lift">
                    <div className={`inline-flex rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.28em] font-black ${card.text} bg-surface-2`}>
                      {card.label}
                    </div>
                    <div className={`mt-4 text-4xl font-black ${card.valueText} tabular-nums`}>{card.value}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-6">
                <section className="rounded-[2rem] bg-surface border border-app shadow-xl p-6 lg:p-8">
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div>
                      <h2 className="text-xl font-black text-foreground tracking-tight">Store Activity</h2>
                      <p className="text-sm text-muted mt-1">Only your own products and performance data are shown here.</p>
                    </div>
                    <button className="app-btn px-5 py-2 text-sm font-bold rounded-full" onClick={() => { setEditing(null); setActiveTab('products'); }}>
                      Add Product
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-surface-2 border border-app p-5">
                      <p className="text-xs font-black uppercase tracking-[0.28em] text-muted">Units Sold</p>
                      <p className="mt-3 text-3xl font-black text-foreground">{summary.totalUnitsSold || 0}</p>
                    </div>
                    <div className="rounded-2xl bg-surface-2 border border-app p-5">
                      <p className="text-xs font-black uppercase tracking-[0.28em] text-muted">Orders</p>
                      <p className="mt-3 text-3xl font-black text-foreground">{summary.totalOrders || 0}</p>
                    </div>
                  </div>
                </section>

                <aside className="rounded-[2rem] bg-[#0b1220] text-white shadow-xl p-6 lg:p-8">
                  <p className="text-[11px] uppercase tracking-[0.35em] text-orange-300 font-black">Focus</p>
                  <h3 className="mt-3 text-2xl font-black">Merchant-only access</h3>
                  <p className="mt-4 text-sm text-slate-300 leading-7">
                    Retailers can sell and manage their own catalog. 
                  </p>
                </aside>
              </div>
            </>
          )}

          {activeTab === 'products' && (
            <div className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-6 items-start">
              <section className="rounded-[2rem] bg-surface border border-app shadow-app p-5 lg:p-6 sticky top-24">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight">{editing ? 'Edit Product' : 'Add Product'}</h2>
                    <p className="text-sm text-muted mt-1">Keep titles, pricing, and imagery consistent for a polished storefront.</p>
                  </div>
                  {editing && (
                    <button className="text-sm font-bold text-muted hover:text-primary" onClick={() => setEditing(null)}>
                      Cancel edit
                    </button>
                  )}
                </div>
                <RetailerProductForm key={editing?._id || 'new-product'} onSubmit={handleProductSubmit} initialData={editing} />
              </section>

              <section className="rounded-[2rem] bg-surface border border-app shadow-app p-6 lg:p-8">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight">Your Products</h2>
                    <p className="text-sm text-muted mt-1">Edit the catalog items you already published.</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-surface-2 px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-muted border border-app">
                    {products.length} items
                  </span>
                </div>
                {loadingProducts ? (
                  <div className="rounded-2xl border border-dashed border-app bg-surface-2 p-8 text-center text-muted">
                    Loading your products...
                  </div>
                ) : (
                  <RetailerProductList products={products} onEdit={setEditing} onDelete={handleProductDelete} />
                )}
              </section>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="rounded-[2rem] bg-surface border border-app shadow-xl p-8">
              <h2 className="text-2xl font-black text-foreground mb-6">Your Orders</h2>
              {loadingOrders ? (
                <div className="text-muted text-center py-8">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="app-card p-8 text-center text-muted">
                  <p className="font-semibold mb-2">No orders yet</p>
                  <p className="text-sm">Orders from customers who purchase your products will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface-2">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase">Order ID</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase">Payment</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase">Fulfillment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app">
                      {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-surface-2/50 transition">
                          <td className="px-6 py-4 text-sm font-mono text-muted">{order._id.substring(0, 8)}...</td>
                          <td className="px-6 py-4 text-sm text-foreground font-semibold">{order.user?.name}</td>
                          <td className="px-6 py-4 text-sm text-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm font-bold text-primary">₹{Number(order.retailerAmount ?? order.totalPrice).toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              order.isPaid && order.isDelivered ? 'bg-accent-1/20 text-accent-1' :
                              order.isPaid ? 'bg-primary/20 text-primary' :
                              'bg-muted/20 text-muted'
                            }`}>
                              {order.isDelivered ? 'Delivered' : order.isPaid ? 'Paid' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <select
                                value={getRetailerFulfillmentStatus(order)}
                                disabled={!order.isPaid || updatingFulfillmentId === order._id}
                                onChange={(e) => handleFulfillmentUpdate(order._id, e.target.value)}
                                className="app-input text-xs py-2"
                              >
                                <option value="pending">Pending</option>
                                <option value="packed">Packed</option>
                                <option value="shipped">Shipped</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="rounded-[2rem] bg-surface border border-app shadow-xl p-8">
              <h2 className="text-2xl font-black text-foreground mb-6">Payments & Analytics</h2>
              {loadingAnalytics ? (
                <div className="text-muted text-center py-8">Loading analytics...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="app-card p-6 border-l-4 border-primary">
                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Total Orders</p>
                    <p className="text-3xl font-black text-foreground">{analytics.totalOrders || 0}</p>
                    <p className="text-xs text-muted mt-2">Orders containing your products</p>
                  </div>
                  <div className="app-card p-6 border-l-4 border-accent-1">
                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Total Revenue</p>
                    <p className="text-3xl font-black text-accent-1">₹{analytics.totalRevenue || 0}</p>
                    <p className="text-xs text-muted mt-2">From your products</p>
                  </div>
                  <div className="app-card p-6 border-l-4 border-accent-2">
                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Units Sold</p>
                    <p className="text-3xl font-black text-accent-2">{analytics.totalUnitsSold || 0}</p>
                    <p className="text-xs text-muted mt-2">Total items sold</p>
                  </div>
                  <div className="app-card p-6 border-l-4 border-accent-3">
                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Avg Order Value</p>
                    <p className="text-3xl font-black text-accent-3">₹{analytics.averageOrderValue || 0}</p>
                    <p className="text-xs text-muted mt-2">Average per order</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="rounded-[2rem] bg-surface border border-app shadow-xl p-8">
              <h2 className="text-2xl font-black text-foreground mb-6">Product Reviews</h2>
              {loadingReviews ? (
                <div className="text-muted text-center py-8">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="app-card p-8 text-center text-muted">
                  <p className="font-semibold mb-2">No reviews yet</p>
                  <p className="text-sm">Customer reviews on your products will appear here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b border-app pb-6 last:border-b-0">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-black text-foreground">{review.name}</p>
                          <p className="text-xs text-muted mt-1">{review.productName}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex gap-0.5 mb-1 justify-end">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < review.rating ? 'text-primary' : 'text-muted'}>
                                ★
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-muted">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RetailerDashboard;
