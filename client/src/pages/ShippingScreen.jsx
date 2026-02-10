import React, { useEffect, useState } from "react";
import {useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import { saveShippingAddress } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import axios from 'axios';

const ShippingScreen = () => {

    // check if user alredy has an address saved in the state

    const cart = useSelector((state) => state.cart);
    const {shippingAddress} = cart;
    const { userInfo } = useSelector((state) => state.auth);

    //set up the state (fill the box if address already exists)

    const [address, setAddress] = useState(shippingAddress.address || "");
    const [city, setCity] = useState(shippingAddress.city || "");
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || "");
    const [country, setCountry] = useState(shippingAddress.country || "");
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
      const fetchAddresses = async () => {
        if (!userInfo) return;

        try {
          const { data } = await axios.get('/api/users/addresses');
          setAddresses(data || []);

          const defaultAddress = data?.find((item) => item.isDefault) || data?.[0];
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress._id);
            setAddress(defaultAddress.address || "");
            setCity(defaultAddress.city || "");
            setPostalCode(defaultAddress.postalCode || "");
            setCountry(defaultAddress.country || "");
          }
        } catch (err) {
          toast.error(err?.response?.data?.message || 'Failed to load saved addresses');
        }
      };

      fetchAddresses();
    }, [userInfo]);

    const submitHandler = (e) => {
        e.preventDefault();
        dispatch(saveShippingAddress({address, city, postalCode, country}));
        navigate("/payment");
    }

    return (
<div className="fs-container fs-section flex justify-center">
      <div className="w-full max-w-lg fs-card p-8">
        <div className="mb-6">
          <p className="fs-pill w-fit">Step 1 of 3</p>
          <h1 className="text-3xl font-black text-slate-900 mt-4">Shipping Address</h1>
        </div>

        {addresses.length > 0 && (
          <div className="mb-6 rounded-2xl border border-white/70 bg-white/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-3">Use saved address</p>
            <select
              className="fs-input"
              value={selectedAddressId}
              onChange={(e) => {
                const nextId = e.target.value;
                setSelectedAddressId(nextId);
                const selected = addresses.find((item) => item._id === nextId);
                if (selected) {
                  setAddress(selected.address || "");
                  setCity(selected.city || "");
                  setPostalCode(selected.postalCode || "");
                  setCountry(selected.country || "");
                }
              }}
            >
              {addresses.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.label || 'Address'} - {item.city}
                </option>
              ))}
            </select>
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-4">
          
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Address</label>
            <input
              type="text"
              required
              className="fs-input"
              placeholder="Enter address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">City</label>
            <input
              type="text"
              required
              className="fs-input"
              placeholder="Enter city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Postal Code</label>
            <input
              type="text"
              required
              className="fs-input"
              placeholder="Enter postal code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Country</label>
            <input
              type="text"
              required
              className="fs-input"
              placeholder="Enter country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full fs-button-primary py-3 mt-4"
          >
            Continue
          </button>

        </form>
      </div>
    </div>
  );
};

export default ShippingScreen;