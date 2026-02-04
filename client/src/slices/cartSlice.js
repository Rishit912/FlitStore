import { createSlice } from '@reduxjs/toolkit';

// 1. Load EVERYTHING from 'cart' (Items, Address, Payment)
// If 'cart' doesn't exist, start with empty arrays/objects
const initialState = localStorage.getItem('cart')
  ? JSON.parse(localStorage.getItem('cart'))
  : { cartItems: [], shippingAddress: {}, paymentMethod: 'PayPal' };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Action 1: Add Item
    addToCart: (state, action) => {
      const item = action.payload;

      // Check if item already exists based on ID
      const existItem = state.cartItems.find((x) => x._id === item._id);

      if (existItem) {
        // If it exists, update it (e.g. new quantity)
        state.cartItems = state.cartItems.map((x) =>
          x._id === existItem._id ? item : x
        );
      } else {
        // If not, add new item
        state.cartItems = [...state.cartItems, item];
      }

      // Save entire state to 'cart'
      localStorage.setItem('cart', JSON.stringify(state));
    },

    // Action 2: Remove Item
    removeFromCart: (state, action) => {
      // Filter out the item matching the ID in payload
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
      
      localStorage.setItem('cart', JSON.stringify(state));
    },

    // Action 3: Save Shipping Address
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('cart', JSON.stringify(state));
    },

    // Action 4: Save Payment Method
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem('cart', JSON.stringify(state));
    },


    // Clear Cart 
    clearCartItems: (state, action) => {
      state.cartItems = [];
      localStorage.setItem('cart', JSON.stringify(state));
    },
  },
});

// Export ALL actions
export const { 
  addToCart, 
  removeFromCart, 
  saveShippingAddress, 
  savePaymentMethod,
  clearCartItems 
} = cartSlice.actions;

export default cartSlice.reducer;