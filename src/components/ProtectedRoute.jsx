import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
        Access denied. Required role: {roles.join(', ')}
      </div>
    );
  }

  return children;
};
