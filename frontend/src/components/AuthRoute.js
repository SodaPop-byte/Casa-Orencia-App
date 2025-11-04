import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    user: null
  });

  // Load user data from local storage on initial app load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setAuth(prevAuth => ({
        ...prevAuth,
        user: JSON.parse(storedUser)
      }));
    }
  }, []);

  // Login function
  const login = (userData, token) => {
    // CRITICAL: We save the token and user info
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setAuth({ token, user: userData });
  };

  // Logout function
  const logout = () => {
    // When logging out, we remove the active token and user
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth({ token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
// Inside AuthRoute.js (Your guard component)

function AuthRoute({ children }) {
  // ... logic
}

// IT MUST BE EXPORTED LIKE THIS:
export default AuthRoute;