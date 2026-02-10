import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');

    try {
      setIsLoading(true);
      const res = await axios.post('/api/users/login', { email, password });

      // If backend says we need to verify...
      if (res.data.navigateVerify) {
        toast.info('OTP sent! Please verify to continue.');
        
        // GO TO VERIFY SCREEN (Make sure this route exists in your App.js)
        // We pass the email so the user doesn't have to type it again
        navigate('/verify', { state: { email: res.data.email } });
      } else {
        dispatch(setCredentials({ ...res.data }));
        navigate(redirect);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fs-container fs-section flex justify-center">
      <div className="w-full max-w-md fs-card p-8">
        <div className="text-center mb-8">
          <p className="fs-pill mx-auto">Welcome back</p>
          <h1 className="text-3xl font-black text-slate-900 mt-4">Sign In</h1>
          <p className="text-slate-500 mt-2">Access your saved carts, orders, and perks.</p>
        </div>
        <form onSubmit={submitHandler} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Email Address</label>
            <input
              type="email"
              placeholder="Enter email"
              className="fs-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              className="fs-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {isLoading ? 'Sending OTP...' : 'Sign In'}
          </button>
          <div className="text-center text-sm text-slate-500">
            <Link to="/forgot-password" className="text-sky-700 font-semibold hover:underline">Forgot password?</Link>
          </div>
        </form>
        <div className="mt-6 pt-6 border-t border-white/70 text-center text-slate-500">
          New Customer? <Link to="/register" className="text-sky-700 font-semibold hover:underline">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;