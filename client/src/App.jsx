import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import './App.css';

// Components
import Header from './components/Header.jsx'; 
import Footer from './components/Footer.jsx';
import AdminRoute from './pages/AdminRoute.jsx'; 

// Public & User Screens
import HomeScreen from './pages/HomeScreen';
import ProductScreen from './pages/ProductScreen';
import CartScreen from './pages/CartScreen'; 
import LoginScreen from './pages/LoginScreen';
import RegisterScreen from './pages/RegisterScreen';
import VerifyScreen from './pages/VerifyScreen';
import ForgotPasswordScreen from './pages/ForgotPasswordScreen';
import ResetPasswordScreen from './pages/ResetPasswordScreen';
import ProfileScreen from './pages/ProfileScreen';
import WishlistScreen from './pages/WishlistScreen';
import TrackingScreen from './pages/TrackingScreen';

// Order & Checkout Screens
import ShippingScreen from './pages/ShippingScreen'; 
import PaymentScreen from './pages/PaymentScreen'; 
import PlaceOrderScreen from './pages/PlaceOrderScreen';
import OrderScreen from './pages/OrderScreen'; 

// Admin Screens
import UserListScreen from './pages/UserListScreen';
import ProductListScreen from './pages/ProductListScreen';
import ProductEditScreen from './pages/ProductEditScreen';
import OrderListScreen from './pages/OrderListScreen';
import CouponListScreen from './screens/admin/CouponListScreen.jsx';
import HomeContentScreen from './pages/HomeContentScreen.jsx';
import AiDiscountScreen from './pages/AiDiscountScreen.jsx';
import ReviewModerationScreen from './pages/ReviewModerationScreen.jsx';

function App() {
  return (
    <Router>
      <ToastContainer 
        position="top-right" 
        autoClose={2000} 
        theme="colored"
      /> 
      <div className="app-shell">
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl"></div>
          <div className="absolute top-24 right-0 h-80 w-80 rounded-full bg-orange-200/50 blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-100/60 blur-3xl"></div>
        </div>

        <Header />

        <main className="app-main">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomeScreen />} />
            <Route path="/product/:id" element={<ProductScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/verify" element={<VerifyScreen />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/reset-password/:token" element={<ResetPasswordScreen />} />

            {/* User Routes */}
            <Route path="/shipping" element={<ShippingScreen />} />
            <Route path="/payment" element={<PaymentScreen />} />
            <Route path="/placeorder" element={<PlaceOrderScreen />} />
            <Route path="/order/:id" element={<OrderScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/wishlist" element={<WishlistScreen />} />
            <Route path="/track/:token" element={<TrackingScreen />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route path="userlist" element={<UserListScreen />} />
              <Route path="productlist" element={<ProductListScreen />} />
              <Route path="product/:id/edit" element={<ProductEditScreen />} />
              <Route path="orderlist" element={<OrderListScreen />} />
              <Route path="couponlist" element={<CouponListScreen />} /> 
              <Route path="homecontent" element={<HomeContentScreen />} />
              <Route path="ai-discounts" element={<AiDiscountScreen />} />
              <Route path="reviews" element={<ReviewModerationScreen />} />
            </Route>

            {/* Search Route */}
            <Route path="/search/:keyword" element={<HomeScreen />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;