import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice'; 
import SearchBox from './SearchBox';

const Header = () => {
  const [userDropdown, setUserDropdown] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);
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

  return (
    <header className="fixed w-full z-40 top-0 left-0 bg-white/75 backdrop-blur border-b border-white/70 shadow-[0_12px_40px_-30px_rgba(15,23,42,0.5)]">
      <nav className="fs-container h-16 flex justify-between items-center">
        
        {/* Branding */}
        <Link to="/" className="text-2xl font-black tracking-tight text-slate-900">
          <span className="text-sky-600">Flit</span>Store
          {userInfo && userInfo.isAdmin && (
            <span className="ml-2 text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-full uppercase tracking-[0.2em] align-middle">Admin</span>
          )}
        </Link>

        {/* Search */}
        {!hideSearchBox && (
          <div className="hidden md:flex flex-grow justify-center">
            <SearchBox />
          </div>
        )}

        {/* Dynamic Navigation */}
        <div className="flex items-center space-x-4">
          
          {(!userInfo || !userInfo.isAdmin) && (
            <>
              {userInfo && (
                <Link to="/wishlist" className="fs-button-ghost px-4 py-2 text-sm text-slate-700 flex items-center gap-2">
                  <i className="fas fa-heart"></i>
                  <span className="font-semibold">Wishlist</span>
                </Link>
              )}
              <Link to="/cart" className="fs-button-ghost px-4 py-2 text-sm text-slate-700 flex items-center gap-2">
                <i className="fas fa-shopping-cart"></i>
                <span className="font-semibold">Cart</span>
              </Link>
            </>
          )}

          {/* 🟢 ADMIN DASHBOARD MENU UPDATED */}
          {userInfo && userInfo.isAdmin && (
            <div className="relative group"> 
              <button 
                onClick={() => setAdminDropdown(!adminDropdown)}
                className="flex items-center gap-2 text-slate-900 font-semibold hover:text-sky-600 transition focus:outline-none py-2"
              >
                Dashboard
                <i className={`fas fa-caret-down transition-transform ${adminDropdown ? 'rotate-180' : ''}`}></i>
              </button>

              {adminDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-60 bg-white/95 backdrop-blur border border-white/80 rounded-2xl shadow-2xl py-2 z-50"
                  onMouseLeave={() => setAdminDropdown(false)}
                >
                  <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Management</div>
                  
                  <Link 
                    to="/admin/userlist" 
                    className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 border-l-4 border-transparent hover:border-sky-600"
                    onClick={() => setAdminDropdown(false)}
                  >
                    User Management
                  </Link>

                  <Link 
                    to="/admin/productlist" 
                    className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 border-l-4 border-transparent hover:border-sky-600"
                    onClick={() => setAdminDropdown(false)}
                  >
                    Product Inventory
                  </Link>

                  <Link 
                    to="/admin/orderlist" 
                    className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 border-l-4 border-transparent hover:border-sky-600"
                    onClick={() => setAdminDropdown(false)}
                  >
                    Order Records
                  </Link>

                  {/* 🟢 NEW: COUPON MANAGEMENT LINK */}
                  <Link 
                    to="/admin/couponlist" 
                    className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 border-l-4 border-transparent hover:border-sky-600"
                    onClick={() => setAdminDropdown(false)}
                  >
                    Manage Coupons
                  </Link>

                  <Link 
                    to="/admin/homecontent" 
                    className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 border-l-4 border-transparent hover:border-sky-600"
                    onClick={() => setAdminDropdown(false)}
                  >
                    Homepage Content
                  </Link>

                  <Link 
                    to="/admin/ai-discounts" 
                    className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 border-l-4 border-transparent hover:border-sky-600"
                    onClick={() => setAdminDropdown(false)}
                  >
                    AI Discounts
                  </Link>

                  <Link 
                    to="/admin/reviews" 
                    className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 border-l-4 border-transparent hover:border-sky-600"
                    onClick={() => setAdminDropdown(false)}
                  >
                    Review Moderation
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* USER SECTION */}
          {userInfo && userInfo.name ? (
            <div className="relative">
              <button 
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-3 bg-white/90 px-4 py-2 rounded-full border border-white/70 shadow-sm hover:bg-white transition focus:outline-none"
              >
                <div className="w-7 h-7 bg-sky-600 rounded-full flex items-center justify-center text-white text-[10px] font-black uppercase">
                  {userInfo.name.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-slate-800">{userInfo.name}</span>          
              </button>

              {userDropdown && (
                <div 
                  className="absolute right-0 mt-3 w-52 bg-white/95 backdrop-blur border border-white/80 rounded-2xl shadow-2xl py-2 z-50"
                  onMouseLeave={() => setUserDropdown(false)}
                >
                  <Link 
                    to="/profile" 
                    className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={() => setUserDropdown(false)}
                  >
                    User Profile
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button 
                    onClick={logoutHandler}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-black uppercase tracking-tight"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/login" 
              className="fs-button-primary px-7 py-2.5"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;