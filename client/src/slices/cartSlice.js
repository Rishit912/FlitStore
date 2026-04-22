import { createSlice } from '@reduxjs/toolkit';

const sanitizeCartState = (state) => {
  if (!state || !Array.isArray(state.cartItems)) {
    return { cartItems: [], shippingAddress: {}, paymentMethod: 'PayPal', discount: 0 };
  }

  const cartItems = state.cartItems
    .filter((item) => item && item._id && item.name && item.image)
    .map((item) => ({
      _id: item._id,
      name: item.name,
      image: item.image,
      price: Number(item.price), 
      originalPrice: Number(item.originalPrice ?? item.price),
      isHaggled: Boolean(item.isHaggled),
      countInStock: item.countInStock,
      qty: item.qty,
    }))
    .filter((item) => !Number.isNaN(item.price));

  return {
    cartItems,
    shippingAddress: state.shippingAddress || {},
    paymentMethod: state.paymentMethod || 'PayPal',
    discount: state.discount || 0, // 🟢 Keep track of applied coupon %
  };
};

const initialState = localStorage.getItem('cart')
  ? sanitizeCartState(JSON.parse(localStorage.getItem('cart')))
  : { cartItems: [], shippingAddress: {}, paymentMethod: 'PayPal', discount: 0 };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const normalizedItem = {
        _id: item._id,
        name: item.name,
        image: item.image,
        price: Number(item.price),
        originalPrice: Number(item.originalPrice ?? item.price),
        isHaggled: Boolean(item.isHaggled),
        countInStock: item.countInStock,
        qty: item.qty,
      };

      const existItem = state.cartItems.find((x) => x._id === normalizedItem._id);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x._id === existItem._id ? normalizedItem : x
        );
      } else {
        state.cartItems = [...state.cartItems, normalizedItem];
      }

      localStorage.setItem('cart', JSON.stringify(state));
    },

    // 🟢 NEW ACTION: Apply Coupon Discount %
    applyDiscount: (state, action) => {
      state.discount = action.payload;
      localStorage.setItem('cart', JSON.stringify(state));
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
      localStorage.setItem('cart', JSON.stringify(state));
    },

    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('cart', JSON.stringify(state));
    },

    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem('cart', JSON.stringify(state));
    },

    clearCartItems: (state) => {
      state.cartItems = [];
      state.discount = 0; // Reset discount on clear
      localStorage.setItem('cart', JSON.stringify(state));
    },
  },
});

export const { 
  addToCart, 
  removeFromCart, 
  saveShippingAddress, 
  savePaymentMethod,
  clearCartItems,
  applyDiscount // 🟢 Export new action
} = cartSlice.actions;

export default cartSlice.reducer;