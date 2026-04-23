import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice'; 
import SearchBox from './SearchBox';

const Header = () => {
  const [userDropdown, setUserDropdown] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);
  
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('theme') || 'light';
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const hideSearchBox = location.pathname === '/payment';

  const logoutHandler = () => {
    dispatch(logout());
    navigate('/login');
    setUserDropdown(false);
    setAdminDropdown(false);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <header className="fixed w-full z-40 top-0 left-0 bg-surface border-b border-app shadow-app backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        
        {/* Branding */}
        <Link to="/" className="text-3xl font-extrabold text-primary tracking-tight flex items-center gap-1 hover:opacity-90 transition-opacity">
          <span className="drop-shadow-sm">Flit</span><span className="text-foreground">Store</span>
          {userInfo?.isAdmin && (
            <span className="ml-2 text-[10px] bg-gradient-to-r from-primary to-foreground text-white px-2 py-0.5 rounded uppercase tracking-widest align-middle shadow-sm">Admin</span>
          )}
        </Link>

        {/* Search - Hidden on specific pages */}
        {!hideSearchBox && (
          <div className="hidden md:flex flex-grow justify-center">
            <SearchBox />
          </div>
        )}

        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme Toggle */}
          <button
            aria-label="Toggle theme"
            className="rounded-full p-2 bg-app border border-app hover:bg-primary/10 transition-colors focus:outline-none"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.95 7.07l-.71-.71M6.34 6.34l-.71-.71" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
            )}
          </button>

          {/* 🔵 RETAILER SECTION: Strictly for Retailers, NOT Admins */}
          {userInfo && userInfo.isRetailer && !userInfo.isAdmin && (
            <Link to="/retailer/dashboard" className="app-btn px-5 py-2 text-sm font-bold ml-2 rounded-xl">
              Merchant Panel
            </Link>
          )}

          {/* 🛒 CART: keep visible for all roles so feature flows are easy to access */}
          <Link to="/cart" className="text-muted hover:text-primary font-semibold transition flex items-center gap-2">
            <i className="fas fa-shopping-cart"></i>
            <span className="hidden sm:inline">Cart</span>
          </Link>

          {/* 🟢 ADMIN DASHBOARD: Strictly for Admins */}
          {userInfo && userInfo.isAdmin && (
            <div className="relative"> 
              <button 
                onClick={() => setAdminDropdown(!adminDropdown)}
                className="flex items-center gap-2 text-foreground font-bold hover:text-primary transition focus:outline-none py-2"
              >
                Admin Menu
                <i className={`fas fa-caret-down transition-transform ${adminDropdown ? 'rotate-180' : ''}`}></i>
              </button>

              {adminDropdown && (
                <div 
                  className="absolute right-0 mt-1 w-56 app-card border border-app shadow-xl py-2 z-50 bg-surface"
                  onMouseLeave={() => setAdminDropdown(false)}
                >
                  <div className="px-4 py-2 text-[10px] font-black text-muted uppercase tracking-widest">Platform Control</div>
                  <Link to="/admin/userlist" className="admin-link" onClick={() => setAdminDropdown(false)}>User Management</Link>
                  <Link to="/admin/productlist" className="admin-link" onClick={() => setAdminDropdown(false)}>Product Inventory</Link>
                  <Link to="/admin/banner" className="admin-link" onClick={() => setAdminDropdown(false)}>Hero Banner</Link>
                  <Link to="/admin/negotiation" className="admin-link" onClick={() => setAdminDropdown(false)}>AI Bargaining</Link>
                  <Link to="/admin/orderlist" className="admin-link" onClick={() => setAdminDropdown(false)}>Order Records</Link>
                  <Link to="/admin/couponlist" className="admin-link" onClick={() => setAdminDropdown(false)}>Manage Coupons</Link>
                </div>
              )}
            </div>
          )}

          {/* USER PROFILE SECTION */}
          {userInfo ? (
            <div className="relative">
              <button 
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-3 bg-surface-2 px-4 py-2 rounded-full border border-app hover:bg-surface transition focus:outline-none"
              >
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-[10px] font-black uppercase shadow-sm">
                  {userInfo.name.charAt(0)}
                </div>
                <span className="hidden sm:inline text-sm font-bold text-foreground">{userInfo.name.split(' ')[0]}</span>          
              </button>

              {userDropdown && (
                <div 
                  className="absolute right-0 mt-3 w-48 app-card border border-app shadow-xl py-2 z-50 bg-surface"
                  onMouseLeave={() => setUserDropdown(false)}
                >
                  <Link to="/profile" className="block px-4 py-3 text-sm font-bold text-foreground hover:bg-surface-2" onClick={() => setUserDropdown(false)}>
                    My Profile
                  </Link>
                  {/* If the user is also a retailer, show an extra link in their user menu */}
                  {userInfo.isRetailer && (
                     <Link to="/retailer/dashboard" className="block px-4 py-3 text-sm font-bold text-primary hover:bg-surface-2" onClick={() => setUserDropdown(false)}>
                        Switch to Seller
                     </Link>
                  )}
                  <hr className="my-1 border-app" />
                  <button onClick={logoutHandler} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50/30 font-black uppercase tracking-tighter">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="app-btn px-8 py-2.5 rounded-full font-bold shadow-app">
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* Internal CSS for clean links */}
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-link {
          display: block;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--foreground);
          border-left: 4px solid transparent;
          transition: all 0.2s;
        }
        .admin-link:hover {
          background-color: var(--surface-2);
          color: var(--primary);
          border-left-color: var(--primary);
        }
      `}} />
    </header>
  );
};

export default Header;