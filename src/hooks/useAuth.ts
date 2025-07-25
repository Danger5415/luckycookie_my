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
      try {
        console.log('🔄 Starting auth initialization...');
        setLoading(true);
        setError(null);
        
        // Check if Supabase is configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        console.log('🔍 Environment variables check:');
        console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
        console.log('Supabase Anon Key:', supabaseKey ? 'Set' : 'Missing');
        
        if (!supabaseUrl || !supabaseKey) {
          console.error('❌ Supabase configuration missing');
          throw new Error('Supabase configuration missing. Please connect to Supabase.');
        }
        
        console.log('✅ Environment variables loaded successfully');
        
        // Set a timeout to prevent infinite loading
        initializationTimeout = setTimeout(() => {
          if (mounted) {
            console.error('⏰ Auth initialization timeout');
            setError('Authentication initialization timed out. Please refresh the page.');
            setLoading(false);
            setInitialized(true);
          }
        }, 25000); // 25 second timeout
        
        console.log('🔐 Getting Supabase session...');
        
        // Get session with timeout
        const sessionPromise = supabase.auth.getSession(); // This is the promise that's not resolving in time
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session request timed out')), 15000); // Increased timeout to 15 seconds
        });
        
        // Increase timeout to 20 seconds for slower connections
        const extendedTimeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session request timed out after 20 seconds')), 20000);
        });
        
        const sessionResult = await Promise.race([sessionPromise, extendedTimeoutPromise]) as any;
        
        // Check if the result is an error from timeout
        if (sessionResult instanceof Error) {
          console.error('❌ Session request timed out:', sessionResult.message);
          throw sessionResult;
        }
        
        if (!mounted) {
          console.log('🚫 Component unmounted, aborting initialization');
          return;
        }
        
        console.log('📦 Session result received');
        
        const { data: { session }, error: sessionError } = sessionResult;
        
        // Handle invalid refresh token errors
        if (sessionError && (
          sessionError.message?.includes('Invalid Refresh Token') ||
          sessionError.message?.includes('refresh_token_not_found') ||
          sessionError.message?.includes('session has expired')
        )) {
          console.log('🔄 Invalid refresh token, signing out...');
          await supabase.auth.signOut();
          if (mounted) setUser(null);
          return;
        }
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          throw sessionError;
        }
        
        console.log('👤 Setting user:', session?.user ? 'User found' : 'No user');
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Temporarily bypass user profile creation to isolate auth issues
          console.log('👤 Skipping user profile creation for debugging');
          // try {
          //   console.log('👤 Creating user profile...');
          //   await createUserProfile(session.user);
          //   console.log('✅ User profile created/updated');
          // } catch (profileError) {
          //   console.warn('⚠️ Profile creation warning:', profileError);
          //   // Don't throw here, user can still use the app
          // }
        }
        
        console.log('✅ Auth initialization completed successfully');
        
      } catch (error: any) {
        if (!mounted) return;
        
        console.error('❌ Auth initialization error:', error);
        setError(error.message || 'Authentication initialization failed');
        setUser(null);
      } finally {
        if (mounted) {
          console.log('🏁 Finalizing auth initialization...');
          clearTimeout(initializationTimeout);
          setLoading(false);
          setInitialized(true);
        }
      }
    };
    
    // Start initialization
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state change:', event);
        
        try {
          setUser(session?.user ?? null);
          setError(null);
          
          if (session?.user && event === 'SIGNED_IN') {
            // Temporarily bypass user profile creation to isolate auth issues
            console.log('👤 Skipping user profile creation in auth state change');
            // try {
            //   await createUserProfile(session.user);
            // } catch (profileError) {
            //   console.warn('Profile creation warning:', profileError);
            //   // Don't throw here, user can still use the app
            // }
          }
        } catch (error: any) {
          console.error('Auth state change error:', error);
          setError(error.message || 'Authentication error occurred');
        }
      }
    );

    return () => {
      console.log('🧹 Cleaning up auth hook...');
      mounted = false;
      clearTimeout(initializationTimeout);
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading, error, initialized };
};