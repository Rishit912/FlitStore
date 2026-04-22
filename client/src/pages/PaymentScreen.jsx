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
        <div className="flex justify-center items-center min-h-[50vh] mt-10">
      <div className="w-full max-w-lg app-card p-8">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Payment Method</h1>
        
        <form onSubmit={submitHandler}>
          <div className="mb-6">
            <label className="block text-muted font-medium mb-4">Select Method</label>
            
            <div className="space-y-3">
              {/* Option: PayPal */}
              <div className="flex items-center p-4 border border-app rounded-lg hover:bg-surface-2 cursor-pointer">
                <input
                  type="radio"
                  id="PayPal"
                  name="paymentMethod"
                  value="PayPal"
                  checked={paymentMethod === 'PayPal'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 text-primary focus:ring-[color:var(--primary)] border-app"
                />
                <label htmlFor="PayPal" className="ml-3 text-lg text-foreground font-medium cursor-pointer">
                  PayPal or Credit Card
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full app-btn py-3"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentScreen;