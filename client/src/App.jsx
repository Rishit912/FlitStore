import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // 👈 Added for notifications
import 'react-toastify/dist/ReactToastify.css'; // 👈 Added for styles
import Header from './components/Header.jsx'; 
import HomeScreen from './pages/HomeScreen';
import ProductScreen from './pages/ProductScreen';
import CartScreen from './pages/CartScreen'; 
import LoginScreen from './pages/LoginScreen';
import ShippingScreen from './pages/ShippingScreen'; 
import PaymentScreen from './pages/PaymentScreen'; 
import PlaceOrderScreen from './pages/PlaceOrderScreen';
import OrderScreen from './pages/OrderScreen'; 
import OrderListScreen from './screens/OrderListScreen';
import ProductListScreen from './pages/ProductListScreen';
import ProductEditScreen from './pages/ProductEditScreen.jsx';

function App() {
  return (
    <Router>
      {/* Toast Container remains at the top level to show alerts on any page */}
      <ToastContainer 
        position="top-right" 
        autoClose={2000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="colored"
      /> 
      
      <Header /> 
      
      {/* Main container with Tailwind background and padding for the fixed header */}
      <main className="bg-gray-50 min-h-screen pt-16">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/product/:id" element={<ProductScreen />} />
          <Route path="/cart" element={<CartScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/shipping" element={<ShippingScreen />} />
          <Route path="/payment" element={<PaymentScreen />} />
          <Route path="/placeorder" element={<PlaceOrderScreen />} />
          <Route path="/order/:id" element={<OrderScreen />} />
          
          {/* Admin Routes */}
          <Route path="/admin/orderlist" element={<OrderListScreen />} />
          <Route path="/admin/productlist" element={<ProductListScreen />} />
          <Route path="/admin/product/:id/edit" element={<ProductEditScreen />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;