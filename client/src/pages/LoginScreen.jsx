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
    <div className="flex justify-center items-center h-[80vh] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Sign In</h1>
        <form onSubmit={submitHandler} className="space-y-5">
          <div>
            <label className="block text-gray-600 font-semibold mb-2">Email Address</label>
            <input
              type="email"
              placeholder="Enter email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 font-semibold mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {isLoading ? 'Sending OTP...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-6 pt-6 border-t text-center text-gray-500">
          New Customer? <Link to="/register" className="text-blue-600 font-bold hover:underline">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;