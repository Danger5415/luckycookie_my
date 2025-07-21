/*
  # Add Admin RLS Policies for Dynamic Prizes

  1. New Policies
    - Allow admin users to INSERT dynamic prizes (for AliExpress sync)
    - Allow admin users to UPDATE dynamic prizes (for inventory management)
    - Allow admin users to DELETE dynamic prizes (for cleanup operations)

  2. Security
    - Policies check for authenticated users with admin email addresses
    - Uses existing user_profiles table to verify admin status
    - Maintains existing read-only policy for regular users

  3. Admin Emails
    - admin@luckycookie.io
    - support@luckycookie.io
    - Can be extended by modifying the email list in policies
*/

-- Drop existing admin policies if they exist to ensure idempotency
DROP POLICY IF EXISTS "Admin can insert dynamic prizes" ON dynamic_prizes;
DROP POLICY IF EXISTS "Admin can update dynamic prizes" ON dynamic_prizes;
DROP POLICY IF EXISTS "Admin can delete dynamic prizes" ON dynamic_prizes;

-- Policy to allow admin users to INSERT dynamic prizes
CREATE POLICY "Admin can insert dynamic prizes"
  ON dynamic_prizes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND email IN ('admin@luckycookie.io', 'support@luckycookie.io')
    )
  );

-- Policy to allow admin users to UPDATE dynamic prizes
CREATE POLICY "Admin can update dynamic prizes"
  ON dynamic_prizes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND email IN ('admin@luckycookie.io', 'support@luckycookie.io')
    )
  );

-- Policy to allow admin users to DELETE dynamic prizes
CREATE POLICY "Admin can delete dynamic prizes"
  ON dynamic_prizes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND email IN ('admin@luckycookie.io', 'support@luckycookie.io')
    )
  );

-- Verify that RLS is enabled on the table (should already be enabled from previous migrations)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'dynamic_prizes'
    AND n.nspname = 'public'
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE dynamic_prizes ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on dynamic_prizes table';
  ELSE
    RAISE NOTICE 'RLS already enabled on dynamic_prizes table';
  END IF;
END $$;

-- Log successful completion
DO $$
BEGIN
  RAISE NOTICE 'Successfully added admin RLS policies for dynamic_prizes table';
  RAISE NOTICE 'Admin users can now INSERT, UPDATE, and DELETE dynamic prizes';
  RAISE NOTICE 'Regular users can still SELECT active dynamic prizes';
END $$;