import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import { saveShippingAddress } from '../slices/cartSlice';

const ShippingScreen = () => {

    // check if user alredy has an address saved in the state

    const cart = useSelector((state) => state.cart);
    const {shippingAddress} = cart;

    //set up the state (fill the box if address already exists)

    const [address, setAddress] = useState(shippingAddress.address || "");
    const [city, setCity] = useState(shippingAddress.city || "");
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || "");
    const [country, setCountry] = useState(shippingAddress.country || "");

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const submitHandler = (e) => {
        e.preventDefault();
        dispatch(saveShippingAddress({address, city, postalCode, country}));
        navigate("/payment");
    }

    return (
<div className="flex justify-center items-center min-h-[50vh] mt-10">
      <div className="w-full max-w-lg app-card p-8">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Shipping Address</h1>

        <form onSubmit={submitHandler} className="space-y-4">
          
          <div>
            <label className="block text-muted font-medium mb-2">Address</label>
            <input
              type="text"
              required
              className="w-full app-input"
              placeholder="Enter address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-muted font-medium mb-2">City</label>
            <input
              type="text"
              required
              className="w-full app-input"
              placeholder="Enter city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-muted font-medium mb-2">Postal Code</label>
            <input
              type="text"
              required
              className="w-full app-input"
              placeholder="Enter postal code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-muted font-medium mb-2">Country</label>
            <input
              type="text"
              required
              className="w-full app-input"
              placeholder="Enter country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full app-btn py-3 mt-4"
          >
            Continue
          </button>

        </form>
      </div>
    </div>
  );
};

export default ShippingScreen;