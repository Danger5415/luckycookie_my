import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingSpinner } from './components/LoadingSpinner';

// Pages
import { Landing } from './pages/Landing';
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
  console.log('🏠 [APP] Render state:', { 
    user: !!user, 
    loading, 
    error: !!error, 
    initialized,
    timestamp: new Date().toISOString()
  });

  // Enhanced monitoring of auth state changes
  React.useEffect(() => {
    console.log('🔍 [APP] Auth state change detected:', {
      user: user ? `${user.email} (${user.id?.slice(0, 8)}...)` : null,
      loading,
      error: error ? `${error.slice(0, 100)}...` : null,
      initialized,
      timestamp: new Date().toISOString(),
      location: window.location.pathname
    });
    
    // Log if we're stuck in loading state
    if (loading && initialized) {
      console.warn('⚠️ [APP] Unusual state: loading=true but initialized=true', {
        user: !!user,
        error: !!error,
        timestamp: new Date().toISOString()
      });
    }
    
    // Log if we have an error but still loading
    if (error && loading) {
      console.warn('⚠️ [APP] Unusual state: error present but still loading', {
        error: error.slice(0, 100),
        user: !!user,
        initialized,
        timestamp: new Date().toISOString()
      });
    }
  }, [user, loading, error, initialized]);

  // Monitor for stuck loading states
  React.useEffect(() => {
    if (loading) {
      console.log('⏳ [APP] Loading state started');
      
      // Set a timer to detect if we're stuck in loading
      const stuckTimer = setTimeout(() => {
        if (loading) {
          console.error('🚨 [APP] STUCK IN LOADING STATE for 45 seconds!', {
            user: !!user,
            error: !!error,
            initialized,
            location: window.location.pathname,
            timestamp: new Date().toISOString()
          });
        }
      }, 45000); // 45 seconds
      
      return () => {
        clearTimeout(stuckTimer);
        console.log('✅ [APP] Loading state cleared');
      };
    }
  }, [loading, user, error, initialized]);

  // Show loading spinner during initial authentication
  if (loading || !initialized) {
    console.log('🔄 [APP] Showing loading spinner', {
      loading,
      initialized,
      reason: !initialized ? 'not initialized' : 'loading'
    });
    return <LoadingSpinner error={error} />;
  }

  // Show error screen if authentication failed
  if (error && !user) {
    console.log('❌ [APP] Showing error screen', { error: error.slice(0, 100) });
    return <LoadingSpinner error={error} onRetry={() => window.location.reload()} />;
  }

  console.log('✅ [APP] Fully loaded, rendering routes', {
    user: user?.email || 'none',
    location: window.location.pathname
  });

  return (
    <Router>
      <Routes>
        {/* Landing Page - Public Route */}
        <Route 
          path="/landing" 
          element={<Landing />} 
        />
        
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
          element={<Navigate to={user ? "/home" : "/landing"} replace />} 
        />
        
        {/* Catch all route */}
        <Route 
          path="*" 
          element={<Navigate to={user ? "/home" : "/landing"} replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;