import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { createUserProfile } from '../lib/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    let initializationTimeout: NodeJS.Timeout;
    
    const initializeAuth = async () => {
      console.log('🔄 Starting auth initialization...');
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Initial state set - loading: true, error: null');
        
        // Check if Supabase is configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        console.log('🔍 Environment check - URL:', supabaseUrl ? 'Set' : 'Missing', 'Key:', supabaseKey ? 'Set' : 'Missing');
        
        if (!supabaseUrl || !supabaseKey) {
          console.error('❌ Supabase configuration missing');
          throw new Error('Supabase configuration missing. Please connect to Supabase.');
        }
        
        console.log('✅ Environment variables validated');
        
        // Set timeout to prevent infinite loading
        initializationTimeout = setTimeout(() => {
          if (mounted) {
            console.error('⏰ Auth initialization timeout after 30 seconds');
            setError('Authentication timed out. Please refresh the page.');
            setLoading(false);
            setInitialized(true);
          }
        }, 30000); // 30 second timeout
        
        console.log('🔐 Calling supabase.auth.getSession()...');
        const sessionStartTime = Date.now();
        
        // Get session with race condition timeout
        const sessionPromise = supabase.auth.getSession();
        const sessionTimeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            console.error('⏰ Session request timed out after 10 seconds');
            reject(new Error('Session request timed out after 10 seconds'));
          }, 10000);
        });
        
        let sessionResult;
        try {
          sessionResult = await Promise.race([sessionPromise, sessionTimeoutPromise]);
        } catch (timeoutError) {
          console.error('❌ Session timeout error:', timeoutError);
          // Try one more time with a direct approach
          console.log('🔄 Attempting direct session retrieval...');
          try {
            sessionResult = await supabase.auth.getSession();
            console.log('✅ Direct session retrieval succeeded');
          } catch (directError) {
            console.error('❌ Direct session retrieval also failed:', directError);
            throw timeoutError; // Throw the original timeout error
          }
        }
        
        const sessionEndTime = Date.now();
        console.log(`📦 Session retrieved in ${sessionEndTime - sessionStartTime}ms`);
        
        if (!mounted) {
          console.log('🚫 Component unmounted during session retrieval');
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
        } catch (extractionError) {
          console.error('❌ Error extracting session data:', extractionError);
          sessionError = extractionError;
        }
        
        console.log('🔍 Session data:', session ? 'Session found' : 'No session', 'Error:', sessionError ? sessionError.message : 'None');
        
        // Handle invalid refresh token errors
        if (sessionError && (
          sessionError.message?.includes('Invalid Refresh Token') ||
          sessionError.message?.includes('refresh_token_not_found') ||
          sessionError.message?.includes('session has expired')
        )) {
          console.log('🔄 Invalid/expired session, clearing auth state...');
          try {
            await supabase.auth.signOut();
          } catch (signOutError) {
            console.warn('⚠️ Error during signOut:', signOutError);
          }
          if (mounted) setUser(null);
          throw new Error('Session expired. Please log in again.');
        }
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError.message);
          throw sessionError;
        }
        
        console.log('👤 Setting user state:', session?.user ? `User: ${session.user.email}` : 'No user');
        if (mounted) {
          setUser(session?.user ?? null);
        }
        
        if (session?.user) {
          try {
            console.log('👤 Creating/updating user profile...');
            const profileStartTime = Date.now();
            await createUserProfile(session.user);
            const profileEndTime = Date.now();
            console.log(`✅ Profile updated in ${profileEndTime - profileStartTime}ms`);
          } catch (profileError) {
            console.warn('⚠️ Profile creation warning (non-critical):', profileError);
            // Don't throw here, user can still use the app
          }
        }
        
        console.log('✅ Auth initialization completed');
        
      } catch (error: any) {
        if (!mounted) return;
        
        console.error('❌ Auth initialization failed:', error.message);
        if (mounted) {
          setError(error.message || 'Authentication failed. Please refresh the page.');
          setUser(null);
        }
      } finally {
        if (mounted) {
          console.log('🏁 Finalizing auth initialization - clearing loading state');
          clearTimeout(initializationTimeout);
          setLoading(false);
          setInitialized(true);
          
          // Final state logging
          setTimeout(() => {
            if (mounted) {
              console.log('🏁 Final auth state:', { 
                user: user ? `${user.email} (${user.id.slice(0, 8)}...)` : null, 
                loading: false, 
                error: error ? error.slice(0, 50) + '...' : null, 
                initialized: true 
              });
            }
          }, 100);
        }
      }
    };
    
    // Start initialization
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state change event:', event, session ? `User: ${session.user?.email}` : 'No session');
        
        try {
          if (mounted) {
            setUser(session?.user ?? null);
            setError(null);
          }
          
          if (session?.user && event === 'SIGNED_IN') {
            try {
              console.log('👤 Auth state change - updating profile for signed in user');
              await createUserProfile(session.user);
            } catch (profileError) {
              console.warn('⚠️ Profile update warning during auth change:', profileError);
              // Don't throw here, user can still use the app
            }
          }
        } catch (error: any) {
          console.error('❌ Auth state change error:', error.message);
          if (mounted) {
            setError(error.message || 'Authentication error occurred');
          }
        }
      }
    );

    return () => {
      console.log('🧹 Cleaning up auth hook');
      mounted = false;
      clearTimeout(initializationTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Debug logging for state changes
  useEffect(() => {
    console.log('🔍 Auth state update:', { 
      user: user ? `${user.email} (${user.id.slice(0, 8)}...)` : null, 
      loading, 
      error: error ? error.slice(0, 50) + '...' : null, 
      initialized 
    });
  }, [user, loading, error, initialized]);
  return { user, loading, error, initialized };
};