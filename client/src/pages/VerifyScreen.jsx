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
    <div className="fs-container fs-section flex justify-center">
      <div className="w-full max-w-md fs-card p-8">
        <div className="text-center mb-6">
          <p className="fs-pill mx-auto">Security check</p>
          <h1 className="text-3xl font-black text-slate-900 mt-4">Verify OTP</h1>
          <p className="text-center text-slate-500 mt-2">Sent to: <span className="font-semibold text-slate-700">{email}</span></p>
        </div>
        
        <form onSubmit={submitHandler} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Enter 6-Digit Code</label>
            <input
              type="text"
              placeholder="123456"
              className="fs-input text-center text-2xl tracking-[0.4em]"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <button
            disabled={isLoading}
            type="submit"
            className={`w-full py-3 rounded-full font-semibold text-white transition-all ${
              isLoading ? 'bg-sky-400' : 'bg-sky-600 hover:bg-sky-700'
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