import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { validatePassword } from '../lib/auth';
import { Cookie, Lock, Eye, EyeOff, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingSession, setIsValidatingSession] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('error');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [sessionValid, setSessionValid] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    validateResetSession();
  }, [searchParams]);

  const validateResetSession = async () => {
    setIsValidatingSession(true);
    setMessage('');
    
    try {
      // Check if we have the required tokens from the URL
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      
      console.log('Reset session validation:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken, 
        type 
      });

      if (!accessToken || !refreshToken) {
        setMessage('Invalid or expired reset link. Please request a new password reset.');
        setMessageType('error');
        setSessionValid(false);
        setIsValidatingSession(false);
        return;
      }

      if (type !== 'recovery') {
        setMessage('Invalid reset link type. Please request a new password reset.');
        setMessageType('error');
        setSessionValid(false);
        setIsValidatingSession(false);
        return;
      }

      // Set the session with the tokens from the URL
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      
      if (error) {
        console.error('Session setup error:', error);
        
        let errorMessage = 'Invalid or expired reset link. Please request a new password reset.';
        
        if (error.message?.includes('expired')) {
          errorMessage = 'Reset link has expired. Please request a new password reset.';
        } else if (error.message?.includes('invalid')) {
          errorMessage = 'Invalid reset link. Please request a new password reset.';
        } else if (error.message?.includes('token')) {
          errorMessage = 'Reset token is invalid. Please request a new password reset.';
        }
        
        setMessage(errorMessage);
        setMessageType('error');
        setSessionValid(false);
        setIsValidatingSession(false);
        return;
      }

      // Verify the session is actually valid by checking the user
      if (!data.session?.user) {
        setMessage('Unable to verify reset session. Please request a new password reset.');
        setMessageType('error');
        setSessionValid(false);
        setIsValidatingSession(false);
        return;
      }

      // Additional validation: check if the session is for password recovery
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        console.error('User verification error:', userError);
        setMessage('Session verification failed. Please request a new password reset.');
        setMessageType('error');
        setSessionValid(false);
        setIsValidatingSession(false);
        return;
      }

      console.log('Reset session validated successfully for user:', userData.user.email);
      setMessage('Reset link verified successfully. You can now set your new password.');
      setMessageType('success');
      setSessionValid(true);
      
    } catch (error: any) {
      console.error('Session validation failed:', error);
      setMessage(`Session validation failed: ${error.message}. Please request a new password reset.`);
      setMessageType('error');
      setSessionValid(false);
    } finally {
      setIsValidatingSession(false);
    }
  };

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    if (newPassword) {
      const validation = validatePassword(newPassword);
      setPasswordErrors(validation.errors);
    } else {
      setPasswordErrors([]);
    }
  };

  const getPasswordStrength = (password: string) => {
    const validation = validatePassword(password);
    const strength = 4 - validation.errors.length;
    
    if (strength === 0) return { level: 'weak', color: 'bg-red-500', text: 'Weak' };
    if (strength === 1) return { level: 'fair', color: 'bg-orange-500', text: 'Fair' };
    if (strength === 2) return { level: 'good', color: 'bg-yellow-500', text: 'Good' };
    if (strength === 3) return { level: 'strong', color: 'bg-green-500', text: 'Strong' };
    return { level: 'very-strong', color: 'bg-green-600', text: 'Very Strong' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionValid) {
      setMessage('Invalid session. Please request a new password reset.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setMessageType('error');

    try {
      // Validation
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setMessage('Please fix the password requirements below.');
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setMessage('Passwords do not match.');
        setIsLoading(false);
        return;
      }

      // Verify session is still valid before updating password
      const { data: currentUser, error: sessionError } = await supabase.auth.getUser();
      
      if (sessionError || !currentUser.user) {
        console.error('Session expired during password update:', sessionError);
        setMessage('Session has expired. Please request a new password reset.');
        setMessageType('error');
        setSessionValid(false);
        setIsLoading(false);
        return;
      }

      console.log('Updating password for user:', currentUser.user.email);

      // Update the password
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Password update error:', error);
        
        let errorMessage = `Failed to update password: ${error.message}`;
        
        if (error.message?.includes('Password should be at least')) {
          errorMessage = 'Password must be at least 8 characters long.';
        } else if (error.message?.includes('Invalid token') || error.message?.includes('expired')) {
          errorMessage = 'Reset session has expired. Please request a new password reset.';
          setSessionValid(false);
        } else if (error.message?.includes('session')) {
          errorMessage = 'Session error occurred. Please try the reset process again.';
          setSessionValid(false);
        } else if (error.message?.includes('same password')) {
          errorMessage = 'New password must be different from your current password.';
        }
        
        setMessage(errorMessage);
        setMessageType('error');
        setIsLoading(false);
        return;
      }

      console.log('Password updated successfully:', data);
      
      setMessage('Password updated successfully! Redirecting to login...');
      setMessageType('success');
      
      // Sign out to ensure clean state
      await supabase.auth.signOut();
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Password updated successfully! Please sign in with your new password.',
            messageType: 'success'
          }
        });
      }, 3000);
      
    } catch (error: any) {
      console.error('Unexpected error during password update:', error);
      setMessage(`Unexpected error: ${error.message}. Please try again.`);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryValidation = () => {
    validateResetSession();
  };

  const handleRequestNewReset = () => {
    navigate('/login', { 
      state: { 
        showResetPassword: true,
        message: 'Please request a new password reset.',
        messageType: 'info'
      }
    });
  };

  const passwordStrength = password ? getPasswordStrength(password) : null;

  // Show loading state during session validation
  if (isValidatingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="flex items-center justify-center mb-4">
            <Cookie className="h-12 w-12 text-yellow-500 mr-2" />
            <h1 className="text-3xl font-bold text-gray-800">Verifying Reset Link</h1>
          </div>
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-yellow-400 border-t-transparent"></div>
          </div>
          <p className="text-gray-600">
            Please wait while we verify your password reset link...
          </p>
        </div>
      </div>
    );
  }

  // Show error state if session is invalid
  if (!sessionValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Cookie className="h-12 w-12 text-red-500 mr-2" />
              <h1 className="text-3xl font-bold text-gray-800">Reset Link Invalid</h1>
            </div>
          </div>

          {message && (
            <div className="mb-6 p-4 rounded-lg text-center bg-red-100 text-red-800 border border-red-200">
              <div className="flex items-center justify-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {message}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleRetryValidation}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-bold hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Validation
            </button>
            
            <button
              onClick={handleRequestNewReset}
              className="w-full bg-yellow-500 text-white py-3 px-4 rounded-lg font-bold hover:bg-yellow-600 transition-colors"
            >
              Request New Reset Link
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Reset links expire after 1 hour for security.</p>
            <p>Make sure you're using the latest reset email.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show password reset form if session is valid
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Cookie className="h-12 w-12 text-yellow-500 mr-2" />
            <h1 className="text-3xl font-bold text-gray-800">Reset Password</h1>
          </div>
          <p className="text-gray-600">
            Enter your new password below to complete the reset process.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                placeholder="Create a strong password"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Password Strength</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength?.level === 'weak' ? 'text-red-600' :
                    passwordStrength?.level === 'fair' ? 'text-orange-600' :
                    passwordStrength?.level === 'good' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {passwordStrength?.text}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength?.color}`}
                    style={{ width: `${((4 - passwordErrors.length) / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Password Requirements */}
            {passwordErrors.length > 0 && (
              <div className="mt-2 space-y-1">
                {passwordErrors.map((error, index) => (
                  <div key={index} className="flex items-center text-xs text-red-600">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {error}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            {/* Password Match Indicator */}
            {confirmPassword && (
              <div className="mt-1 flex items-center text-xs">
                {password === confirmPassword ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                    <span className="text-green-600">Passwords match</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1 text-red-600" />
                    <span className="text-red-600">Passwords do not match</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || passwordErrors.length > 0 || !sessionValid}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-4 rounded-lg font-bold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? 'Updating Password...' : 'Update Password 🔒'}
          </button>
        </form>

        {/* Message Display */}
        {message && (
          <div className={`mt-4 p-4 rounded-lg text-center ${
            messageType === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : messageType === 'info'
              ? 'bg-blue-100 text-blue-800 border border-blue-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center justify-center">
              {messageType === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {message}
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center mb-2">
            <Lock className="h-4 w-4 mr-1" />
            <span>Secure Password Reset</span>
          </div>
          <p>Your new password will be encrypted and stored securely</p>
          <p className="mt-1">Reset links expire after 1 hour for security</p>
        </div>
      </div>
    </div>
  );
};