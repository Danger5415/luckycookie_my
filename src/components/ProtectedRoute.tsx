import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, error, initialized } = useAuth();

  // Show loading only if not initialized yet
  if (loading || !initialized) {
    return <LoadingSpinner error={error} />;
  }

  // If there's an error and no user, redirect to login
  if (error && !user) {
    return <Navigate to="/login" replace />;
  }

  // If no user after initialization, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};