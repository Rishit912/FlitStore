import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice'; 

const Header = () => {
  const [userDropdown, setUserDropdown] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = () => {
    dispatch(logout());
    navigate('/login');
    setUserDropdown(false);
    setAdminDropdown(false);
  };

  return (
    <header className="fixed w-full z-40 top-0 left-0 bg-white border-b border-gray-200 shadow-sm font-sans">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        
        {/* Branding */}
        <Link to="/" className="text-2xl font-black text-blue-600 tracking-tighter">
          FLIT<span className="text-gray-900">CODE</span>
          {userInfo && userInfo.isAdmin && (
            <span className="ml-2 text-xs bg-black text-white px-2 py-1 rounded uppercase tracking-widest">Admin</span>
          )}
        </Link>

        {/* Dynamic Navigation */}
        <div className="flex items-center space-x-8">
          
          {/* 1. CART: Only show if NOT an Admin */}
          {(!userInfo || !userInfo.isAdmin) && (
            <Link to="/cart" className="text-gray-600 hover:text-blue-600 font-semibold transition flex items-center gap-2">
              <i className="fas fa-shopping-cart"></i>
              <span>Cart</span>
            </Link>
          )}

          {/* 2. ADMIN DASHBOARD: Only show if Admin */}
          {userInfo && userInfo.isAdmin && (
            <div className="relative">
              <button 
                onClick={() => setAdminDropdown(!adminDropdown)}
                className="flex items-center gap-2 text-gray-900 font-bold hover:text-blue-600 transition focus:outline-none"
              >
                Dashboard
                <i className={`fas fa-caret-down transition-transform ${adminDropdown ? 'rotate-180' : ''}`}></i>
              </button>

              {adminDropdown && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase">Management</div>
                  <Link 
                    to="/admin/productlist" 
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-l-4 border-transparent hover:border-blue-600"
                    onClick={() => setAdminDropdown(false)}
                  >
                    Product Inventory
                  </Link>
                  <Link 
                    to="/admin/orderlist" 
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-l-4 border-transparent hover:border-blue-600"
                    onClick={() => setAdminDropdown(false)}
                  >
                    Order Records
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 3. USER / LOGIN SECTION */}
          {userInfo ? (
            <div className="relative">
              <button 
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-100 transition focus:outline-none"
              >
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px]">
                  {userInfo.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-bold text-gray-800">{userInfo.name}</span>
              </button>

              {userDropdown && (
                <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-50">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setUserDropdown(false)}
                  >
                    User Profile
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button 
                    onClick={logoutHandler}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-bold"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-gray-900 text-white px-8 py-2.5 rounded-full font-bold hover:bg-black transition transform hover:scale-105 active:scale-95 shadow-lg"
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