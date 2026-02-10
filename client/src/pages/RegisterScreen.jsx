import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      // 1. Call the backend Register API
      await axios.post('/api/users', { name, email, password });

      toast.info('OTP sent to your email! Please verify.');
      
      // 3. Move to the verification page
      navigate('/verify', { state: { email } });
    } catch (err) {
      // Improved error handling to show the actual backend message
      toast.error(err?.response?.data?.message || err.message || 'Error occurred');
    }
  };

  return (
    <div className='fs-container fs-section flex justify-center'>
      <form onSubmit={submitHandler} className='fs-card p-8 w-full max-w-md'>
        <div className='text-center mb-6'>
          <p className='fs-pill mx-auto'>Join FlitStore</p>
          <h1 className='text-3xl font-black text-slate-900 mt-4'>Create Account</h1>
          <p className='text-slate-500 mt-2'>Get early access to the latest releases.</p>
        </div>
        
        <div className='space-y-4'>
          <input
            type='text'
            placeholder='Enter Name'
            className='fs-input'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type='email'
            placeholder='Enter Email'
            className='fs-input'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type='password'
            placeholder='Enter Password'
            className='fs-input'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type='password'
            placeholder='Confirm Password'
            className='fs-input'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button 
            type='submit' 
            className='w-full fs-button-primary py-3'
          >
            Register & Send OTP
          </button>
        </div>

        <div className='mt-6 text-center text-sm text-slate-500'>
          Already have an account? <Link to='/login' className='text-sky-700 font-semibold hover:underline ml-1'>Login</Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterScreen;