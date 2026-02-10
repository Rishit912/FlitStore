import { createSlice } from '@reduxjs/toolkit';

const normalizeCartItem = (item) => ({
  _id: item._id,
  name: item.name,
  image: item.image,
  price: Number(item.price),
  originalPrice: Number(item.originalPrice || item.price),
  countInStock: item.countInStock,
  qty: item.qty,
});

const sanitizeCartState = (state) => {
  if (!state || !Array.isArray(state.cartItems)) {
    return { cartItems: [], savedItems: [], shippingAddress: {}, paymentMethod: 'PayPal', discount: 0 };
  }

  const cartItems = state.cartItems
    .filter((item) => item && item._id && item.name && item.image)
    .map((item) => normalizeCartItem(item))
    .filter((item) => !Number.isNaN(item.price));

  const savedItems = Array.isArray(state.savedItems)
    ? state.savedItems
        .filter((item) => item && item._id && item.name && item.image)
        .map((item) => normalizeCartItem(item))
        .filter((item) => !Number.isNaN(item.price))
    : [];

  return {
    cartItems,
    savedItems,
    shippingAddress: state.shippingAddress || {},
    paymentMethod: state.paymentMethod || 'PayPal',
    discount: state.discount || 0, // 🟢 Keep track of applied coupon %
  };
};

const initialState = localStorage.getItem('cart')
  ? sanitizeCartState(JSON.parse(localStorage.getItem('cart')))
  : { cartItems: [], savedItems: [], shippingAddress: {}, paymentMethod: 'PayPal', discount: 0 };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      if (!item || !item._id) {
        return;
      }
      const normalizedItem = normalizeCartItem(item);

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

    saveForLater: (state, action) => {
      const item = state.cartItems.find((x) => x._id === action.payload);
      if (!item) return;

      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
      const exists = state.savedItems.find((x) => x._id === item._id);
      if (!exists) {
        state.savedItems = [...state.savedItems, { ...item, qty: 1 }];
      }
      localStorage.setItem('cart', JSON.stringify(state));
    },

    moveToCart: (state, action) => {
      const item = state.savedItems.find((x) => x._id === action.payload);
      if (!item) return;

      state.savedItems = state.savedItems.filter((x) => x._id !== action.payload);
      const exists = state.cartItems.find((x) => x._id === item._id);
      if (!exists) {
        state.cartItems = [...state.cartItems, { ...item, qty: 1 }];
      }
      localStorage.setItem('cart', JSON.stringify(state));
    },

    removeSavedItem: (state, action) => {
      state.savedItems = state.savedItems.filter((x) => x._id !== action.payload);
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
  saveForLater,
  moveToCart,
  removeSavedItem,
  saveShippingAddress, 
  savePaymentMethod,
  clearCartItems,
  applyDiscount // 🟢 Export new action
} = cartSlice.actions;

export default cartSlice.reducer;