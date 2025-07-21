/*
  # Fix dynamic_prizes source constraint to allow amazon

  1. Changes
    - Update the source check constraint to allow 'amazon' as a valid source
    - This resolves the constraint violation errors when syncing Amazon prizes

  2. Security
    - Maintains existing RLS policies
    - No changes to access control
*/

-- Drop the existing constraint
ALTER TABLE dynamic_prizes DROP CONSTRAINT IF EXISTS dynamic_prizes_source_check;

-- Add the updated constraint that includes 'amazon'
ALTER TABLE dynamic_prizes ADD CONSTRAINT dynamic_prizes_source_check 
  CHECK (source IN ('aliexpress', 'manual', 'amazon'));