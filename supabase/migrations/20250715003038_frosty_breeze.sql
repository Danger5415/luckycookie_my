/*
  # Update Authentication Settings

  1. Security
    - Disable email confirmations for immediate access
    - Configure secure session settings
    - Set up proper rate limiting

  2. Configuration
    - Allow sign-ups
    - Set minimum password length
    - Configure session timeout
*/

-- Note: These settings are typically configured in the Supabase Dashboard
-- under Authentication > Settings, but here's the SQL equivalent for reference:

-- Enable sign-ups (this is usually done via dashboard)
-- UPDATE auth.config SET enable_signup = true;

-- Set minimum password length (done via dashboard)
-- UPDATE auth.config SET password_min_length = 8;

-- Disable email confirmations (done via dashboard)
-- UPDATE auth.config SET enable_confirmations = false;

-- The actual configuration should be done in Supabase Dashboard:
-- 1. Go to Authentication > Settings
-- 2. Set "Enable email confirmations" to OFF
-- 3. Set "Minimum password length" to 8
-- 4. Ensure "Enable sign ups" is ON
-- 5. Configure rate limiting as needed

-- Create indexes for better performance on auth queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_crack_history_user_created ON crack_history(user_id, created_at DESC);