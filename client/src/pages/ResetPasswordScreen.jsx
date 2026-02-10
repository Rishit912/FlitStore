import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { setCredentials } from '../slices/authSlice';

const ResetPasswordScreen = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.put(`/api/users/reset-password/${token}`, { password });
      dispatch(setCredentials({ ...res.data }));
      toast.success('Password reset successful');
      navigate('/');
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fs-container fs-section flex justify-center">
      <div className="w-full max-w-md fs-card p-8">
        <div className="text-center mb-6">
          <p className="fs-pill mx-auto">Secure reset</p>
          <h1 className="text-3xl font-black text-slate-900 mt-4">Set New Password</h1>
          <p className="text-slate-500 mt-2">Create a strong password you can remember.</p>
        </div>

        <form onSubmit={submitHandler} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              className="fs-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              className="fs-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {isLoading ? 'Updating...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Back to <Link to="/login" className="text-sky-700 font-semibold hover:underline">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;
