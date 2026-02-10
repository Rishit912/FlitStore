export const addToCart = (id, qty) => async (dispatch, getState) => {
  // ... fetch product logic ...
  dispatch({
    type: CART_ADD_ITEM,
    payload: { ...data, qty }
  });

  // This saves the cart items to the browser so they don't disappear
  localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems));
};