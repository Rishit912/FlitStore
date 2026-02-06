import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';

const VerifyScreen = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();
  const email = state?.email; // This gets the email from LoginScreen navigate state

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    // If user is already logged in, send them home
    if (userInfo) {
      navigate('/');
    }
    // If someone tries to access /verify without an email (manual URL type), send to login
    if (!email) {
      toast.error('Please login first');
      navigate('/login');
    }
  }, [navigate, userInfo, email]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await axios.post('/api/users/verify', { email, otp });
      
      // THIS IS THE FINAL STEP: Save to Redux and LocalStorage
      dispatch(setCredentials({ ...res.data }));
      toast.success('Verified successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">Verify OTP</h1>
        <p className="text-center text-gray-500 mb-6">Sent to: <span className="font-bold text-gray-700">{email}</span></p>
        
        <form onSubmit={submitHandler} className="space-y-5">
          <div>
            <label className="block text-gray-600 font-semibold mb-2">Enter 6-Digit Code</label>
            <input
              type="text"
              placeholder="123456"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <button
            disabled={isLoading}
            type="submit"
            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
              isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Verifying...' : 'Verify & Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyScreen;