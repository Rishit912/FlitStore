import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

// Components
import Header from './components/Header.jsx'; 
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
import ProductListScreen from './pages/ProductListScreen';
import ProductEditScreen from './pages/ProductEditScreen';
import OrderListScreen from './pages/OrderListScreen';

function App() {
  return (
    <Router>
      <ToastContainer 
        position="top-right" 
        autoClose={2000} 
        theme="colored"
      /> 
      
      <Header /> 
      
      <main className="bg-gray-50 min-h-screen pt-16">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomeScreen />} />
          <Route path="/product/:id" element={<ProductScreen />} />
          <Route path="/cart" element={<CartScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/verify" element={<VerifyScreen />} />

          {/* User Routes */}
          <Route path="/shipping" element={<ShippingScreen />} />
          <Route path="/payment" element={<PaymentScreen />} />
          <Route path="/placeorder" element={<PlaceOrderScreen />} />
          <Route path="/order/:id" element={<OrderScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />

          {/* Admin Routes - Fixed nesting */}
          <Route path='/admin' element={<AdminRoute />}>
            <Route path='userlist' element={<UserListScreen />} />
            <Route path="productlist" element={<ProductListScreen />} />
            <Route path="product/:id/edit" element={<ProductEditScreen />} />
            <Route path="orderlist" element={<OrderListScreen />} />
          </Route>

          {/* HomeScreen now handles both regular view and search view */}
          <Route path="/" element={<HomeScreen />} />
          <Route path="/search/:keyword" element={<HomeScreen />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;