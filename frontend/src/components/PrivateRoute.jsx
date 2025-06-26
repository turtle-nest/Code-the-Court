// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); // stored on login

  // 🔒 Not connected: redirection
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 🔐 Role not allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // ✅ Everything is good, we return the component
  return children;
};

export default PrivateRoute;
