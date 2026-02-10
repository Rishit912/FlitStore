import { configureStore } from '@reduxjs/toolkit';
import cartSliceReducer from './slices/cartSlice';
import authSliceReducer from './slices/authSlice';
import { orderListReducer, orderDeliverReducer } from './reducers/orderReducers';
import { 
  productListReducer, 
  productDetailsReducer, 
  productDeleteReducer, 
  productCreateReducer,
  productUpdateReducer 
} from './reducers/productReducers'; 

const store = configureStore({
  reducer: {
    cart: cartSliceReducer,
    auth: authSliceReducer,
    productList: productListReducer,
    productDetails: productDetailsReducer,
    productDelete: productDeleteReducer,
    productCreate: productCreateReducer,
    productUpdate: productUpdateReducer, 
    orderList: orderListReducer,
    orderDeliver: orderDeliverReducer,
  },
});

export default store;