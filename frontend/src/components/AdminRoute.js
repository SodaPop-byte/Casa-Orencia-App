import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

// This component will wrap any page we want to protect
function AdminRoute({ children }) {
  const { auth } = useContext(AuthContext);

  // 1. Check if the user is logged in AND their role is 'admin'
  if (auth.user && auth.user.role === 'admin') {
    // If they are an admin, show the page they asked for
    return children;
  }

  // 2. If they are not an admin, kick them back to the login page
  return <Navigate to="/login" />;
}

export default AdminRoute;