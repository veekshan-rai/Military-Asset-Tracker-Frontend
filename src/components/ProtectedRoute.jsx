// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUser } from '../utils/auth';
import ErrorMessage from './ErrorMessage';

export default function ProtectedRoute({ children, allowedRoles }) {
  // 1. If user is not logged in, redirect to login page
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // 2. If allowedRoles parameter is provided, check user's role
  const user = getUser();
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) {
      return (
        <div style={{ padding: '32px' }}>
          <ErrorMessage message="Access Denied: You do not have permission to view this page." />
        </div>
      );
    }
  }

  return children;
}
