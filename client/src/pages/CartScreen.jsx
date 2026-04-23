import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaTrash } from 'react-icons/fa';
import { removeFromCart, updateCartItem } from '../slices/cartSlice';
import { toast } from 'react-toastify';

const CartScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const GST_RATE = 0.18;
  const [bargainingItemId, setBargainingItemId] = useState('');
  const [offerByItem, setOfferByItem] = useState({});

  // 1. Get Cart Data from Redux Store
  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;
  const actualItemsTotal = cartItems.reduce((acc, item) => acc + item.qty * Number(item.originalPrice ?? item.price), 0);
  const finalItemsTotal = cartItems.reduce((acc, item) => acc + item.qty * Number(item.price), 0);
  const haggleSavings = Math.max(actualItemsTotal - finalItemsTotal, 0);
  const taxableValue = finalItemsTotal;
  const gstAmount = taxableValue * GST_RATE;
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;
  const shippingCharge = 0;
  const invoiceTotal = taxableValue + gstAmount + shippingCharge;
  const haggledItemsCount = cartItems.filter((item) => item.isHaggled).length;
  const hasInvalidStockItem = cartItems.some((item) => {
    const stockNumber = Number(item.countInStock);
    const hasKnownStock = Number.isFinite(stockNumber);
    if (!hasKnownStock) return false;
    const safeStock = Math.max(0, stockNumber);
    return safeStock <= 0 || Number(item.qty) > safeStock;
  });

  const checkoutHandler = () => {
    if (hasInvalidStockItem) {
      toast.error('One or more items are out of stock. Please update your cart first.');
      return;
    }
    // This will eventually go to login/payment
    navigate('/login?redirect=/shipping');
  };

  const startBargain = (item) => {
    const originalPrice = Number(item.originalPrice ?? item.price);
    setBargainingItemId(item._id);
    setOfferByItem((prev) => ({
      ...prev,
      [item._id]: originalPrice,
    }));
  };

  const applyBargain = (item) => {
    const originalPrice = Number(item.originalPrice ?? item.price);
    const offeredPrice = Number(offerByItem[item._id]);
    const minAllowed = Number((originalPrice * 0.9).toFixed(2));

    if (Number.isNaN(offeredPrice) || offeredPrice <= 0) {
      toast.error('Please enter a valid offer amount.');
      return;
    }

    if (offeredPrice >= minAllowed && offeredPrice < originalPrice) {
      dispatch(
        updateCartItem({
          ...item,
          price: Number(offeredPrice.toFixed(2)),
          originalPrice,
          isHaggled: true,
          qty: Number(item.qty || 1),
        })
      );
      setBargainingItemId('');
      toast.success(`Deal accepted! New price: ₹${offeredPrice.toFixed(2)}`);
      return;
    }

    if (offeredPrice >= originalPrice) {
      toast.info('Offer must be lower than current price.');
      return;
    }

    toast.error(`Offer too low. Minimum allowed is ₹${minAllowed.toFixed(2)}.`);
  };

  const resetBargain = (item) => {
    const originalPrice = Number(item.originalPrice ?? item.price);
    dispatch(
      updateCartItem({
        ...item,
        price: originalPrice,
        originalPrice,
        isHaggled: false,
        qty: Number(item.qty || 1),
      })
    );
    toast.info('Bargain removed. Price reset to original.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="app-card p-4">
          Your cart is empty. <Link to="/" className="font-bold text-primary">Go Back</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              (() => {
                const stockNumber = Number(item.countInStock);
                const hasKnownStock = Number.isFinite(stockNumber);
                const safeStock = hasKnownStock ? Math.max(0, stockNumber) : Math.max(1, Number(item.qty || 1));
                const qtyUpperBound = Math.max(safeStock, Number(item.qty || 1));
                const qtyOptions = qtyUpperBound > 0 ? [...Array(qtyUpperBound).keys()] : [];
                const canBargain = safeStock > 0 || !hasKnownStock;
                return (
              <div key={item._id} className="app-card p-4 flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                
                <div className="flex-1 xl:ml-4 min-w-0">
                  <Link to={`/product/${item._id}`} className="font-bold text-foreground hover:text-primary">
                    {item.name}
                  </Link>
                  {item.size && (
                    <div className="mt-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                      Size: {item.size}
                    </div>
                  )}
                  <div className="text-sm mt-1">
                    {item.isHaggled ? (
                      <div className="space-y-1">
                        <p className="text-muted line-through">Original: ₹{Number(item.originalPrice).toFixed(2)}</p>
                        <p className="text-accent-1 font-bold">Deal Price: ₹{Number(item.price).toFixed(2)}</p>
                        <p className="inline-flex items-center rounded-full bg-accent-1/10 border border-accent-1/30 px-2 py-1 text-[11px] font-bold text-accent-1 w-fit">
                          You saved ₹{(Math.max(Number(item.originalPrice || item.price) - Number(item.price), 0) * Number(item.qty || 1)).toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted">₹{Number(item.price).toFixed(2)}</p>
                    )}
                  </div>
                  {hasKnownStock && safeStock <= 0 && <p className="text-danger text-xs font-bold mt-2">Out of stock</p>}
                  {safeStock > 0 && Number(item.qty) > safeStock && <p className="text-danger text-xs font-bold mt-2">Only {safeStock} left in stock</p>}

                </div>

                <div className="w-full xl:w-[320px] xl:self-start space-y-3">
                  <div className="flex items-center justify-end gap-2">
                    {/* Update Qty in Cart */}
                    <select 
                      value={safeStock > 0 ? Math.min(Number(item.qty), safeStock) : Number(item.qty || 1)}
                      disabled={hasKnownStock && safeStock <= 0}
                      onChange={(e) => dispatch(updateCartItem({ ...item, qty: Number(e.target.value) }))}
                      className="app-input"
                    >
                      {qtyOptions.map((x) => (
                        <option key={x + 1} value={x + 1}>{x + 1}</option>
                      ))}
                    </select>

                    {/* Remove Button */}
                    <button
                      onClick={() => dispatch(removeFromCart(item._id))}
                      className="text-red-500 hover:text-red-400 p-2"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  {canBargain && (
                    <div className="rounded-xl border border-accent-1/30 bg-accent-1/10 p-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-accent-1 mb-2">AI Bargain Zone</p>
                      {bargainingItemId === item._id ? (
                        <div className="flex flex-col gap-2">
                          <input
                            type="number"
                            min="1"
                            className="app-input text-sm w-full"
                            value={offerByItem[item._id] ?? ''}
                            onChange={(e) =>
                              setOfferByItem((prev) => ({
                                ...prev,
                                [item._id]: e.target.value,
                              }))
                            }
                            placeholder="Enter your offer"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => applyBargain(item)}
                              className="app-btn px-4 py-2.5 text-sm font-black"
                            >
                              Apply Deal
                            </button>
                            <button
                              type="button"
                              onClick={() => setBargainingItemId('')}
                              className="border border-app bg-surface-2 text-muted px-4 py-2.5 rounded-lg text-sm font-bold"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => startBargain(item)}
                            className="w-full border-2 border-accent-1 text-accent-1 bg-white/40 hover:bg-white/60 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide shadow-md"
                          >
                            AI Bargain
                          </button>
                          {item.isHaggled && (
                            <button
                              type="button"
                              onClick={() => resetBargain(item)}
                              className="w-full border border-app bg-surface-2 text-muted px-4 py-2.5 rounded-xl text-sm font-bold"
                            >
                              Remove Deal
                            </button>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-muted mt-2 font-semibold">AI allows up to 10% off from original price.</p>
                    </div>
                  )}

                  <Link
                    to={`/product/${item._id}#reviews-section`}
                    className="block w-full text-center border border-app bg-surface-2 text-foreground px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-surface"
                  >
                    Open Reviews
                  </Link>
                </div>
              </div>
                );
              })()
            ))}
          </div>

          {/* Right: Subtotal Box */}
          <div className="app-card p-6 h-fit">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)}) items
            </h2>
            {haggledItemsCount > 0 && (
              <div className="mb-4 rounded-lg bg-accent-1/10 border border-accent-1/30 px-3 py-2 text-xs font-bold text-accent-1">
                Haggle deal applied on {haggledItemsCount} item(s)
              </div>
            )}

            <div className="space-y-2 text-sm mb-6">
              <div className="flex justify-between text-muted">
                <span>Actual Price</span>
                <span>₹{actualItemsTotal.toFixed(2)}</span>
              </div>
              {haggleSavings > 0 && (
                <div className="flex justify-between text-accent-1 font-semibold">
                  <span>Haggle Savings</span>
                  <span>-₹{haggleSavings.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted">
                <span>Taxable Value</span>
                <span>₹{taxableValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>CGST (9%)</span>
                <span>₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>SGST (9%)</span>
                <span>₹{sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span>{shippingCharge === 0 ? 'Free' : `₹${shippingCharge.toFixed(2)}`}</span>
              </div>
              <div className="border-t border-app pt-2 flex justify-between text-xl font-bold text-foreground">
                <span>Invoice Total</span>
                <span>₹{invoiceTotal.toFixed(2)}</span>
              </div>
            </div>
            <button 
              onClick={checkoutHandler}
              disabled={hasInvalidStockItem}
              className="w-full app-btn py-3"
            >
              {hasInvalidStockItem ? 'Fix Cart Stock Issues' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartScreen;