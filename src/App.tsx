import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingSpinner } from './components/LoadingSpinner';

// Pages
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Premium } from './pages/Premium';
import { PremiumCrack } from './pages/PremiumCrack';
import { ResetPassword } from './pages/ResetPassword';
import { Admin } from './pages/Admin';
import { Leaderboard } from './pages/Leaderboard';

function App() {
  const { user, loading, error, initialized } = useAuth();

  // Debug logging
  console.log('🏠 App render state:', { 
    user: !!user, 
    loading, 
    error: !!error, 
    initialized 
  });

  // Show loading spinner during initial authentication
  if (loading || !initialized) {
    console.log('🔄 Showing loading spinner');
    return <LoadingSpinner error={error} />;
  }

  // Show error screen if authentication failed
  if (error && !user) {
    console.log('❌ Showing error screen');
    return <LoadingSpinner error={error} onRetry={() => window.location.reload()} />;
  }

  console.log('✅ App fully loaded, rendering routes');

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/home" replace /> : <Login />} 
        />
        
        {/* Password Reset Route */}
        <Route 
          path="/reset-password" 
          element={<ResetPassword />} 
        />
        
        {/* Public Leaderboard Route */}
        <Route 
          path="/leaderboard" 
          element={<Leaderboard />} 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/premium" 
          element={
            <ProtectedRoute>
              <Premium />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/premium/crack" 
          element={
            <ProtectedRoute>
              <PremiumCrack />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Route (password protected separately) */}
        <Route path="/admin" element={<Admin />} />
        
        {/* Redirect root to appropriate page */}
        <Route 
          path="/" 
          element={<Navigate to={user ? "/home" : "/login"} replace />} 
        />
        
        {/* Catch all route */}
        <Route 
          path="*" 
          element={<Navigate to={user ? "/home" : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;