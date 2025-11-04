import React, { createContext, useState, useEffect } from 'react';

// 1. Create the context
// This is the "container" that will hold our global state
export const AuthContext = createContext();

// 2. Create the "Provider" component
// This component will wrap our entire app and "provide" the state
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'), // On load, get token from browser's local storage
    user: null
  });

  // This runs when the app first loads
  useEffect(() => {
    // Check if user info is also in local storage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      // If yes, set it in our state
      setAuth(prevAuth => ({
        ...prevAuth,
        user: JSON.parse(storedUser)
      }));
    }
  }, []);

  // 3. Login function
  // This will be called from our LoginPage
  const login = (userData, token) => {
    localStorage.setItem('token', token); // Save token to browser
    localStorage.setItem('user', JSON.stringify(userData)); // Save user info to browser
    setAuth({ token, user: userData }); // Update the global state
  };

  // 4. Logout function
  // This will be called from our navbar
  const logout = () => {
    localStorage.removeItem('token'); // Remove token from browser
    localStorage.removeItem('user'); // Remove user info from browser
    setAuth({ token: null, user: null }); // Clear the global state
  };

  // 5. Provide the state (auth) and the functions (login, logout) to the whole app
  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};