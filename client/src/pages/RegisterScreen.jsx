import { useState } from 'react';
import AccountTypeStep from '../components/AccountTypeStep';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const RegisterScreen = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState('');

  const navigate = useNavigate();


  const handleBasicSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setStep(2);
  };

  const handleRegister = async () => {
    try {
      const res = await axios.post('/api/users', { name, email, password, isRetailer: accountType === 'retailer' });
      sessionStorage.setItem('pendingVerificationEmail', res.data.email);
      toast.info('OTP sent to your email! Please verify.');
      navigate('/verify', { state: { email: res.data.email, fromRegister: true } });
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Error occurred';
      if (msg.toLowerCase().includes('user already exists') || msg.toLowerCase().includes('duplicate')) {
        toast.error('An account with this email already exists. Please login or use a different email.');
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <div className='flex justify-center items-center min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4'>
      <div className='app-card p-8 w-full max-w-md'>
        {step === 1 && (
          <form onSubmit={handleBasicSubmit} className='space-y-4'>
            <div className='flex flex-col items-center mb-6'>
                <div className='relative mb-2'>
                  <div className='absolute -inset-1 rounded-full blur-xl opacity-70 bg-gradient-to-br from-orange-300 to-fuchsia-400' aria-hidden></div>
                  <div className='relative w-20 h-20 flex items-center justify-center rounded-full shadow-2xl bg-gradient-to-br from-primary to-accent-3 ring-2 ring-white/30'>
                    <span className='text-3xl font-extrabold text-white tracking-widest select-none'>FS</span>
                  </div>
                </div>
              <h1 className='text-2xl font-bold text-center text-foreground'>Create Account</h1>
            </div>
            <input
              type='text'
              placeholder='Enter Name'
              className='w-full app-input'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type='email'
              placeholder='Enter Email'
              className='w-full app-input'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type='password'
              placeholder='Enter Password'
              className='w-full app-input'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type='password'
              placeholder='Confirm Password'
              className='w-full app-input'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type='submit' className='w-full app-btn'>Next</button>
            <div className='mt-6 text-center text-sm text-muted'>
              Already have an account? <Link to='/login' className='text-primary font-bold hover:underline ml-1'>Login</Link>
            </div>
          </form>
        )}
        {step === 2 && (
          <AccountTypeStep
            accountType={accountType}
            setAccountType={setAccountType}
            onNext={handleRegister}
            onBack={() => setStep(1)}
          />
        )}
      </div>
    </div>
  );
};

export default RegisterScreen;