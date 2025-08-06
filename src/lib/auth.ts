import { supabase } from './supabase';
import { withTimeout } from '../utils/timeout';
import type { User } from '@supabase/supabase-js';

export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: undefined, // Disable email confirmation
    },
  });
  
  if (error) throw error;
  return data;
};

export const signInWithPassword = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
    captchaToken: undefined, // Disable captcha for now
  });
  if (error) throw error;
};

export const deleteAccount = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user found');

  // Delete user profile and related data (cascade will handle related records)
  const { error: profileError } = await supabase
    .from('user_profiles')
    .delete()
    .eq('id', user.id);

  if (profileError) throw profileError;

  // Sign out the user
  await signOut();
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const createUserProfile = async (user: User) => {
  try {
    // First, create or update the basic user profile
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        email: user.email!,
      }, {
        onConflict: 'id'
      });
    
    if (error) {
      // Log the error but don't throw for duplicate key errors
      if (error.code === '23505') {
        console.warn('User profile already exists:', error.message);
        // Continue to try updating country even if profile exists
      }
      throw error;
    }

    // Try to get and update user's country based on IP geolocation
    try {
      console.log('🌍 Attempting to get user country via geolocation...');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        const geoResponse = await withTimeout(
          fetch(`${supabaseUrl}/functions/v1/get-user-country`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
            },
          }),
          10000,
          'Geolocation request timed out'
        );

        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          console.log('🌍 Geolocation response:', geoData);
          
          if (geoData.country && geoData.country !== 'Unknown') {
            // Update user profile with country information
            const { error: countryError } = await supabase
              .from('user_profiles')
              .update({ country: geoData.country })
              .eq('id', user.id);
              
            if (countryError) {
              console.warn('⚠️ Failed to update user country:', countryError.message);
            } else {
              console.log('✅ Successfully updated user country:', geoData.country);
            }
          } else {
            console.log('🌍 Geolocation returned unknown country, skipping update');
          }
        } else {
          console.warn('⚠️ Geolocation API request failed:', geoResponse.status);
        }
      } else {
        console.warn('⚠️ Supabase configuration missing for geolocation');
      }
    } catch (geoError) {
      console.warn('⚠️ Geolocation error (non-critical):', geoError);
      // Don't throw here - country detection failure shouldn't break user registration
    }
  } catch (error: any) {
    // Handle network errors gracefully
    if (error.message?.includes('fetch')) {
      console.warn('Network error during profile creation:', error.message);
      return;
    }
    throw error;
  }
};

// Password validation helper
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Email validation helper
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};