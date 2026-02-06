import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../slices/authSlice';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      // 1. Call the backend Register API
      const res = await axios.post('/api/users', { name, email, password });

      // 2. Save full data (including name) so Header.jsx doesn't crash
      dispatch(setCredentials({ ...res.data })); 
      
      toast.info('OTP sent to your email! Please verify.');
      
      // 3. Move to the verification page
      navigate('/verify');
    } catch (err) {
      // Improved error handling to show the actual backend message
      toast.error(err?.response?.data?.message || err.message || 'Error occurred');
    }
  };

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-50 p-4'>
      <form onSubmit={submitHandler} className='bg-white p-8 rounded-lg shadow-md w-full max-w-md'>
        <h1 className='text-2xl font-bold mb-6 text-center text-gray-800'>Create Account</h1>
        
        <div className='space-y-4'>
          <input
            type='text'
            placeholder='Enter Name'
            className='w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type='email'
            placeholder='Enter Email'
            className='w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type='password'
            placeholder='Enter Password'
            className='w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type='password'
            placeholder='Confirm Password'
            className='w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button 
            type='submit' 
            className='w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700 transition duration-200'
          >
            Register & Send OTP
          </button>
        </div>

        <div className='mt-6 text-center text-sm text-gray-600'>
          Already have an account? <Link to='/login' className='text-blue-600 font-bold hover:underline ml-1'>Login</Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterScreen;