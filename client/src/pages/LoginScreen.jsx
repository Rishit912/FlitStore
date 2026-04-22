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
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

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

  // Password reset handler
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) return toast.error('Please enter your email');
    try {
      setResetLoading(true);
      await axios.post('/api/users/reset-password', { email: resetEmail });
      toast.success('Password reset link sent! Check your email.');
      setShowReset(false);
      setResetEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-center items-center h-[80vh] px-4 bg-gradient-to-br from-white via-blue-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full max-w-md app-card p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-2">
              <div className="absolute -inset-1 rounded-full blur-xl opacity-70 bg-gradient-to-br from-orange-300 to-fuchsia-400" aria-hidden></div>
              <div className="relative w-20 h-20 flex items-center justify-center rounded-full shadow-2xl bg-gradient-to-br from-primary to-accent-3 ring-2 ring-white/30">
                <span className="text-3xl font-extrabold text-white tracking-widest select-none">FS</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center text-foreground">Sign In</h1>
          </div>
          <form onSubmit={submitHandler} className="space-y-5">
            <div>
              <label className="block text-muted font-semibold mb-2">Email Address</label>
              <input
                type="email"
                placeholder="Enter email"
                className="w-full app-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-muted font-semibold mb-2">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                className="w-full app-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="text-right mt-2">
                <button type="button" className="text-primary font-bold hover:underline text-sm" onClick={() => setShowReset(true)}>
                  Forgot Password?
                </button>
              </div>
            </div>
            <button
              disabled={isLoading}
              type="submit"
              className={`w-full py-3 rounded-lg font-bold transition-all ${
                isLoading ? 'bg-blue-400 text-white' : 'app-btn'
              }`}
            >
              {isLoading ? 'Sending OTP...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-app text-center text-muted">
            New Customer? <Link to="/register" className="text-primary font-bold hover:underline">Register</Link>
          </div>
          {/* Password Reset Modal (feature stub) */}
          {showReset && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="app-card p-6 w-full max-w-sm relative">
                <button className="absolute top-2 right-2 text-muted hover:text-primary" onClick={() => setShowReset(false)}>&times;</button>
                <h2 className="text-xl font-bold mb-4 text-foreground">Reset Password</h2>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <input type="email" className="w-full app-input" placeholder="Enter your email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required />
                  <button type="submit" className="w-full app-btn py-3">Send Reset Link</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LoginScreen;