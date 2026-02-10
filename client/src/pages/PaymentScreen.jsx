import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { savePaymentMethod } from '../slices/cartSlice';

const  PaymentScreen = () => {
    const [paymentMethod, setPaymentMethod] = useState('PayPal');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const cart = useSelector((state) => state.cart);
    const { shippingAddress } = cart;

    useEffect(() => {
        // If no shipping address, redirect to shipping screen
        if (!shippingAddress.address) {
            navigate('/shipping');
        }   
    }, [shippingAddress, navigate]);

    const submitHandler = (e) => {
        e.preventDefault();

        // Save payment method to Redux state
        dispatch(savePaymentMethod(paymentMethod));

        //redirect to place order
        navigate('/placeorder');
    };

    return (
        <div className="fs-container fs-section flex justify-center">
      <div className="w-full max-w-lg fs-card p-8">
        <div className="mb-6">
          <p className="fs-pill w-fit">Step 2 of 3</p>
          <h1 className="text-3xl font-black text-slate-900 mt-4">Payment Method</h1>
        </div>
        
        <form onSubmit={submitHandler}>
          <div className="mb-6">
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-4">Select Method</label>
            
            <div className="space-y-3">
              {/* Option: PayPal */}
              <div className="flex items-center p-4 border border-white/80 rounded-2xl bg-white/80 hover:bg-white cursor-pointer shadow-sm">
                <input
                  type="radio"
                  id="PayPal"
                  name="paymentMethod"
                  value="PayPal"
                  checked={paymentMethod === 'PayPal'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 text-sky-600 focus:ring-sky-500 border-slate-300"
                />
                <label htmlFor="PayPal" className="ml-3 text-lg text-slate-700 font-semibold cursor-pointer">
                  PayPal or Credit Card
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full fs-button-primary py-3"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentScreen;