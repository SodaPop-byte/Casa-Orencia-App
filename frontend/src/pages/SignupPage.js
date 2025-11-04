import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    birthday: ''
  });
  const [error, setError] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    if (auth.token) {
      navigate('/');
    }
  }, [auth.token, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSigningUp) return;
    setIsSigningUp(true);
    setError('');

    try {
      await axios.post('http://localhost:4000/api/auth/register', formData);
      alert('Signup successful! Please log in.');
      navigate('/login');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Email already in use or server error.';
      setError(errMsg);
    } finally {
      setIsSigningUp(false);
    }
  };
  
  if (auth.token) {
    return null;
  }

  return (
    // Use the theme-light background
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-theme-light">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold font-serif tracking-tight text-gray-900">
            Create your Reseller Account
          </h2>
        </div>
        
        <form 
          onSubmit={handleSubmit} 
          className="mt-8 space-y-6 bg-white p-8 shadow-xl rounded-lg border border-gray-200"
        >
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                // Use theme-accent for the focus ring
                className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-theme-accent focus:outline-none focus:ring-theme-accent sm:text-sm"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                disabled={isSigningUp}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                // Use theme-accent for the focus ring
                className="relative block w-full appearance-none rounded-none border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-theme-accent focus:outline-none focus:ring-theme-accent sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                disabled={isSigningUp}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                // Use theme-accent for the focus ring
                className="relative block w-full appearance-none rounded-none border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-theme-accent focus:outline-none focus:ring-theme-accent sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSigningUp}
              />
            </div>
            <div>
              <label htmlFor="birthday" className="block text-sm font-medium text-gray-500 pt-3 pl-1">Birthday (Optional)</label>
              <input
                id="birthday"
                name="birthday"
                type="date"
                // Use theme-accent for the focus ring
                className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-theme-accent focus:outline-none focus:ring-theme-accent sm:text-sm"
                placeholder="Birthday"
                value={formData.birthday}
                onChange={handleChange}
                disabled={isSigningUp}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              // Use theme-accent for the button
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-theme-accent py-3 px-4 text-sm font-medium text-white hover:bg-theme-accent-hover focus:outline-none focus:ring-2 focus:ring-theme-accent focus:ring-offset-2 disabled:bg-gray-400"
              disabled={isSigningUp}
            >
              {isSigningUp ? 'Creating Account...' : 'Sign up'}
            </button>
          </div>
        </form>
        
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-theme-dark hover:text-theme-accent">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;