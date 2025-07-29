import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Debug environment variables
console.log('🔧 Supabase configuration check:');
console.log('URL present:', !!supabaseUrl);
console.log('Key present:', !!supabaseAnonKey);
console.log('URL value:', supabaseUrl);

// More thorough validation - check for empty strings and whitespace
const isValidUrl = supabaseUrl && supabaseUrl.trim() !== '' && supabaseUrl.startsWith('https://');
const isValidKey = supabaseAnonKey && supabaseAnonKey.trim() !== '' && supabaseAnonKey.length > 20;

console.log('URL is valid:', isValidUrl);
console.log('Key is valid:', isValidKey);
console.log('URL length:', supabaseUrl?.length || 0);
console.log('Key length:', supabaseAnonKey?.length || 0);

// Validate environment variables more strictly
if (!isValidUrl || !isValidKey) {
  const errorMessage = `CRITICAL ERROR: Invalid Supabase configuration!
    URL valid: ${isValidUrl} (${supabaseUrl})
    Key valid: ${isValidKey} (length: ${supabaseAnonKey?.length || 0})
    Please check your .env file.`;
  console.error(errorMessage);
  throw new Error(errorMessage); // Crash early with a clear error
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'luckycookie-web'
    }
  }
});

// Test connection with better error handling
console.log('🔌 Testing Supabase connection...');
supabase.auth.getSession()
  .then(() => {
    console.log('✅ Supabase connection test successful');
  })
  .catch((error) => {
    console.error('❌ Supabase connection test failed:', error);
  });

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          last_crack_time: string | null;
          streak: number;
          total_cracks: number;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          last_crack_time?: string | null;
          streak?: number;
          total_cracks?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          last_crack_time?: string | null;
          streak?: number;
          total_cracks?: number;
          created_at?: string;
        };
      };
      crack_history: {
        Row: {
          id: string;
          user_id: string;
          fortune: string;
          won: boolean;
          gift_name: string | null;
          gift_value: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          fortune: string;
          won?: boolean;
          gift_name?: string | null;
          gift_value?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          fortune?: string;
          won?: boolean;
          gift_name?: string | null;
          gift_value?: number | null;
          created_at?: string;
        };
      };
      prizes: {
        Row: {
          id: string;
          name: string;
          price_usd: number;
          image_url: string;
          is_premium: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price_usd: number;
          image_url: string;
          is_premium?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price_usd?: number;
          image_url?: string;
          is_premium?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
      };
      premium_cookies: {
        Row: {
          id: string;
          user_id: string;
          prize_id: string;
          purchased_at: string;
          status: string;
          claim_code: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          prize_id: string;
          purchased_at?: string;
          status?: string;
          claim_code?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          prize_id?: string;
          purchased_at?: string;
          status?: string;
          claim_code?: string;
        };
      };
    };
  };
};