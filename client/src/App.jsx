import ResetPasswordScreen from './pages/ResetPasswordScreen';
import RetailerDashboard from './pages/RetailerDashboard';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

// Components
import Header from './components/Header.jsx'; 
import CouponNotice from './components/CouponNotice.jsx';
import BannerPopup from './components/BannerPopup.jsx';
import Footer from './components/Footer.jsx';
import AdminRoute from './pages/AdminRoute.jsx'; 

// Public & User Screens
import HomeScreen from './pages/HomeScreen';
import ProductScreen from './pages/ProductScreen';
import CartScreen from './pages/CartScreen'; 
import LoginScreen from './pages/LoginScreen';
import RegisterScreen from './pages/RegisterScreen';
import VerifyScreen from './pages/VerifyScreen';
import ProfileScreen from './pages/ProfileScreen';

// Order & Checkout Screens
import ShippingScreen from './pages/ShippingScreen'; 
import PaymentScreen from './pages/PaymentScreen'; 
import PlaceOrderScreen from './pages/PlaceOrderScreen';
import OrderScreen from './pages/OrderScreen'; 

// Admin Screens
import UserListScreen from './pages/UserListScreen';
import BannerEditScreen from './screens/admin/BannerEditScreen';
import ProductListScreen from './pages/ProductListScreen';
import ProductEditScreen from './pages/ProductEditScreen';
import OrderListScreen from './pages/OrderListScreen';
import CouponListScreen from './screens/admin/CouponListScreen';
import NegotiationChart from './pages/NegotiationChart.jsx';

function App() {
  return (
    <Router>
      <ToastContainer 
        position="top-right" 
        autoClose={2000} 
        theme="colored"
        pauseOnHover={false} // 🟢 Professional touch: don't pause on hover for short alerts
      /> 
      <BannerPopup />
      
      <div className="flex flex-col min-h-screen bg-app">
        <Header /> 
        <CouponNotice className="mt-16" />
        
        {/* pt-20 matches your fixed header height for a seamless look */}
        <main className="flex-grow pt-20 pb-10"> 
          <Routes>
            {/* Public Routes */}
            <Route index element={<HomeScreen />} /> {/* 🟢 Use 'index' for the root path */}
            <Route path="/search/:keyword" element={<HomeScreen />} />
            <Route path="/product/:id" element={<ProductScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />

            <Route path="/reset-password/:token" element={<ResetPasswordScreen />} />
            <Route path="/verify" element={<VerifyScreen />} />

            {/* User Routes */}
            <Route path="/shipping" element={<ShippingScreen />} />
            <Route path="/payment" element={<PaymentScreen />} />
            <Route path="/placeorder" element={<PlaceOrderScreen />} />
            <Route path="/order/:id" element={<OrderScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />

            {/* Retailer Dashboard Route */}
            <Route path="/retailer/dashboard" element={<RetailerDashboard />} />

            {/* Admin Routes - Nested Logic Verified */}
            <Route path='/admin' element={<AdminRoute />}>
              <Route index element={<OrderListScreen />} /> {/* 🟢 Default admin view */}
              <Route path='userlist' element={<UserListScreen />} />
              <Route path="productlist" element={<ProductListScreen />} />
              <Route path="product/:id/edit" element={<ProductEditScreen />} />
              <Route path="orderlist" element={<OrderListScreen />} />
              <Route path="couponlist" element={<CouponListScreen />} /> 
              <Route path="banner" element={<BannerEditScreen />} />
              <Route path="negotiation" element={<NegotiationChart />} />
            </Route>

            {/* 🟢 404 Page (Optional but professional) */}
            <Route path="*" element={
              <div className="text-center py-20 uppercase font-black tracking-widest text-muted">
                404 | Page Not Found
              </div>
            } />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;