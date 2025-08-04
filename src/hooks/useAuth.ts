import { useState, useEffect } from 'react';
import { useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { createUserProfile } from '../lib/auth';
import { withTimeout } from '../utils/timeout';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const initializeAuth = useCallback(async () => {
    let mounted = true;
    let initializationTimeout: NodeJS.Timeout;
      console.log('🔄 [AUTH] Starting auth initialization...', {
        timestamp: new Date().toISOString(),
        mounted,
        currentState: { user: !!user, loading, error: !!error, initialized }
      });
      
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 [AUTH] Initial state set - loading: true, error: null');
        
        // Check if Supabase is configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        console.log('🔍 [AUTH] Environment check - URL:', supabaseUrl ? 'Set' : 'Missing', 'Key:', supabaseKey ? 'Set' : 'Missing');
        
        if (!supabaseUrl || !supabaseKey) {
          console.error('❌ [AUTH] Supabase configuration missing');
          throw new Error('Supabase configuration missing. Please connect to Supabase.');
        }
        
        console.log('✅ [AUTH] Environment variables validated');
        
        // Set timeout to prevent infinite loading
        initializationTimeout = setTimeout(() => {
          if (mounted) {
            console.error('⏰ [AUTH] Auth initialization timeout after 30 seconds', {
              mounted,
              currentState: { user: !!user, loading, error: !!error, initialized }
            });
            setError('Authentication timed out. Please refresh the page.');
            setLoading(false);
            setInitialized(true);
          }
        }, 30000); // 30 second timeout
        
        console.log('🔐 [AUTH] Calling supabase.auth.getSession()...');
        const sessionStartTime = Date.now();
        
        // Get session with timeout
        const sessionResult = await withTimeout(
          supabase.auth.getSession(),
          10000,
          'Session request timed out after 10 seconds'
        );
        
        const sessionEndTime = Date.now();
        console.log(`📦 [AUTH] Session retrieved in ${sessionEndTime - sessionStartTime}ms`);
        
        if (!mounted) {
          console.log('🚫 [AUTH] Component unmounted during session retrieval');
          return;
        }
        
        // Safely extract session data with defensive checks
        let session = null;
        let sessionError = null;
        
        try {
          if (sessionResult && typeof sessionResult === 'object') {
            if (sessionResult.data && typeof sessionResult.data === 'object') {
              session = sessionResult.data.session || null;
            }
            sessionError = sessionResult.error || null;
          }
          console.log('📊 [AUTH] Session data extracted:', {
            hasSession: !!session,
            hasError: !!sessionError,
            sessionUserId: session?.user?.id?.slice(0, 8) + '...' || 'none'
          });
        } catch (extractionError) {
          console.error('❌ [AUTH] Error extracting session data:', extractionError);
          sessionError = extractionError;
        }
        
        console.log('🔍 [AUTH] Session data:', session ? 'Session found' : 'No session', 'Error:', sessionError ? sessionError.message : 'None');
        
        // Handle invalid refresh token errors
        if (sessionError && (
          sessionError.message?.includes('Invalid Refresh Token') ||
          sessionError.message?.includes('refresh_token_not_found') ||
          sessionError.message?.includes('session has expired')
        )) {
          console.log('🔄 [AUTH] Invalid/expired session, clearing auth state...');
          try {
            await supabase.auth.signOut();
            console.log('✅ [AUTH] Successfully signed out expired session');
          } catch (signOutError) {
            console.warn('⚠️ [AUTH] Error during signOut:', signOutError);
          }
          if (mounted) setUser(null);
          throw new Error('Session expired. Please log in again.');
        }
        
        if (sessionError) {
          console.error('❌ [AUTH] Session error:', sessionError.message);
          throw sessionError;
        }
        
        console.log('👤 [AUTH] Setting user state:', session?.user ? `User: ${session.user.email}` : 'No user');
        if (mounted) {
          setUser(session?.user ?? null);
          console.log('✅ [AUTH] User state updated in component');
        }
        
        if (session?.user) {
          try {
            console.log('👤 [AUTH] Creating/updating user profile...');
            const profileStartTime = Date.now();
            await withTimeout(
              createUserProfile(session.user),
              8000,
              'Profile creation timed out'
            );
            const profileEndTime = Date.now();
            console.log(`✅ [AUTH] Profile updated in ${profileEndTime - profileStartTime}ms`);
          } catch (profileError) {
            console.warn('⚠️ [AUTH] Profile creation warning (non-critical):', profileError);
            // Don't throw here, user can still use the app
          }
        }
        
        console.log('✅ [AUTH] Auth initialization completed successfully');
        
      } catch (error: any) {
        if (!mounted) return;
        
        console.error('❌ [AUTH] Auth initialization failed:', error.message, {
          mounted,
          errorType: error.constructor.name,
          stack: error.stack?.split('\n').slice(0, 3)
        });
        if (mounted) {
          setError(error.message || 'Authentication failed. Please refresh the page.');
          setUser(null);
          console.log('❌ [AUTH] Error state set in component');
        }
      } finally {
        if (mounted) {
          console.log('🏁 [AUTH] Finalizing auth initialization - clearing loading state', {
            mounted,
            aboutToSetLoading: false,
            aboutToSetInitialized: true
          });
          clearTimeout(initializationTimeout);
          setLoading(false);
          setInitialized(true);
          console.log('🏁 [AUTH] Loading and initialized state updated');
          
          // Final state logging
          setTimeout(() => {
            if (mounted) {
              console.log('🏁 [AUTH] Final auth state check:', { 
                user: user ? `${user.email} (${user.id.slice(0, 8)}...)` : null, 
                loading: false, 
                error: error ? error.slice(0, 50) + '...' : null, 
                initialized: true,
                timestamp: new Date().toISOString()
              });
            }
          }, 100);
        } else {
          console.log('🚫 [AUTH] Component unmounted, skipping state updates in finally block');
        }
      }
    
    return () => {
      mounted = false;
      clearTimeout(initializationTimeout);
    };
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    // Start initialization
    console.log('🚀 [AUTH] Starting auth initialization process');
    initializeAuth().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 [AUTH] Auth state change event:', event, session ? `User: ${session.user?.email}` : 'No session', {
          currentUser: user?.email || 'none',
          timestamp: new Date().toISOString()
        });
        
        try {
          setUser(session?.user ?? null);
          setError(null);
          console.log('✅ [AUTH] Auth state change - user state updated');
          
          if (session?.user && event === 'SIGNED_IN') {
            try {
              console.log('👤 [AUTH] Auth state change - updating profile for signed in user');
              await withTimeout(
                createUserProfile(session.user),
                8000,
                'Profile creation during auth change timed out'
              );
              console.log('✅ [AUTH] Profile updated during auth state change');
            } catch (profileError) {
              console.warn('⚠️ [AUTH] Profile update warning during auth change:', profileError);
              // Don't throw here, user can still use the app
            }
          }
        } catch (error: any) {
          console.error('❌ [AUTH] Auth state change error:', error.message);
          setError(error.message || 'Authentication error occurred');
          console.log('❌ [AUTH] Error set during auth state change');
        }
      }
    );

    return () => {
      console.log('🧹 [AUTH] Cleaning up auth hook', {
        finalUser: user?.email || 'none',
        finalLoading: loading,
        finalInitialized: initialized
      });
      cleanup?.();
      subscription.unsubscribe();
    };
  }, [initializeAuth]);

  // Listen for tab visibility changes to re-authenticate when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      console.log('👁️ [AUTH] Visibility change detected:', {
        visibilityState: document.visibilityState,
        currentError: !!error,
        currentLoading: loading,
        currentInitialized: initialized,
        timestamp: new Date().toISOString()
      });

      // If the tab becomes visible and we're in an error state (likely from a timeout),
      // silently re-initialize authentication
      if (document.visibilityState === 'visible' && error && initialized) {
        console.log('🔄 [AUTH] Tab became visible with error state - re-initializing auth silently');
        initializeAuth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [error, initialized, initializeAuth]);

  // Debug logging for state changes
  useEffect(() => {
    console.log('🔍 [AUTH] State update detected:', { 
      user: user ? `${user.email} (${user.id.slice(0, 8)}...)` : null, 
      loading, 
      error: error ? error.slice(0, 50) + '...' : null, 
      initialized,
      timestamp: new Date().toISOString()
    });
  }, [user, loading, error, initialized]);
  
  return { user, loading, error, initialized };
};