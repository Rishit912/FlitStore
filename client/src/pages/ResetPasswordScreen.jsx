import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ResetPasswordScreen = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirm) return toast.error('Please fill in all fields');
    if (password !== confirm) return toast.error('Passwords do not match');
    try {
      setLoading(true);
      await axios.post(`/api/users/reset-password/${token}`, { password });
      toast.success('Password reset successful! You can now sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh] px-4">
      <div className="w-full max-w-md app-card p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-foreground">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-muted font-semibold mb-2">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full app-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-muted font-semibold mb-2">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full app-input"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="app-btn w-full py-3" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;
