import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    try {
      setIsLoading(true);
      await axios.post('/api/users/forgot-password', { email });
      toast.success('Reset link sent. Please check your email.');
      navigate('/login');
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fs-container fs-section flex justify-center">
      <div className="w-full max-w-md fs-card p-8">
        <div className="text-center mb-6">
          <p className="fs-pill mx-auto">Account help</p>
          <h1 className="text-3xl font-black text-slate-900 mt-4">Forgot Password</h1>
          <p className="text-slate-500 mt-2">We will send a reset link to your email.</p>
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

          <button
            disabled={isLoading}
            type="submit"
            className={`w-full py-3 rounded-full font-semibold text-white transition-all ${
              isLoading ? 'bg-sky-400' : 'bg-sky-600 hover:bg-sky-700'
            }`}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Remembered your password?
          <Link to="/login" className="text-sky-700 font-semibold hover:underline ml-1">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;
