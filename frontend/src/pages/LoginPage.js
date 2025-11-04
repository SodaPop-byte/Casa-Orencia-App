import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const { auth, login } = useContext(AuthContext);

  useEffect(() => {
    if (auth.token) {
      navigate('/');
    }
  }, [auth.token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setError('');
    
    try {
      const res = await axios.post('http://localhost:4000/api/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
      setIsLoggingIn(false);
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
            Sign in to your account
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
          
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                // Use theme-accent for the focus ring
                className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-theme-accent focus:outline-none focus:ring-theme-accent sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoggingIn}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                // Use theme-accent for the focus ring
                className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-theme-accent focus:outline-none focus:ring-theme-accent sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoggingIn}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              // Use theme-accent for the button
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-theme-accent py-3 px-4 text-sm font-medium text-white hover:bg-theme-accent-hover focus:outline-none focus:ring-2 focus:ring-theme-accent focus:ring-offset-2 disabled:bg-gray-400"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-theme-dark hover:text-theme-accent">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;