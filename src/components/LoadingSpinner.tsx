import React from 'react';

interface LoadingSpinnerProps {
  error?: string | null;
  onRetry?: () => void;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  error, 
  onRetry,
  message = "Loading your fortune..." 
}) => {
  // Debug logging
  console.log('🔄 LoadingSpinner rendered with:', { error, message });
  
  // Check for session expiration errors
  const isSessionExpired = error && (
    error.includes('Invalid Refresh Token') ||
    error.includes('refresh_token_not_found') ||
    error.includes('session has expired')
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">{isSessionExpired ? '🔐' : '⚠️'}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {isSessionExpired ? 'Session Expired' : 
             error.includes('Supabase') ? 'Configuration Error' : 'Connection Error'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isSessionExpired ? 'Your session has expired. Please log in again.' : error}
          </p>
          <div className="space-y-3">
            {error.includes('Supabase configuration missing') && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 text-sm">
                  Click the "Connect to Supabase" button in the top right corner to set up your database connection.
                </p>
              </div>
            )}
            {onRetry && (
              <button
                onClick={onRetry}
                className="w-full bg-yellow-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-yellow-600 transition-colors"
              >
                {isSessionExpired ? 'Log In Again' : 'Try Again'}
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-gray-600 transition-colors"
            >
              Refresh Page
            </button>
          </div>
          {!error.includes('Supabase') && (
            <div className="mt-6 text-sm text-gray-500">
              <p>If the problem persists:</p>
              <ul className="mt-2 space-y-1">
                <li>• Check your internet connection</li>
                <li>• Clear your browser cache</li>
                <li>• Try a different browser</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🍪</div>
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent"></div>
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
        <p className="mt-2 text-sm text-gray-500">This should only take a moment</p>
        
        {/* Debug info in development */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow-lg text-left max-w-md mx-auto">
            <h4 className="font-bold text-gray-800 mb-2">Debug Info:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Environment: {import.meta.env.MODE}</div>
              <div>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing'}</div>
              <div>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}</div>
              <div>Error: {error || 'None'}</div>
            </div>
          </div>
        )}
        
        {/* Progress indicator */}
        <div className="mt-6 w-64 mx-auto">
          <div className="bg-gray-200 rounded-full h-2">
            <div className="bg-yellow-400 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};