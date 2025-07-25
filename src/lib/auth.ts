import { supabase } from './supabase';
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
        return;
      }
      throw error;
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