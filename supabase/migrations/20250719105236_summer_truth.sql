/*
  # Fix shipping_addresses foreign key relationship

  1. Changes
    - Alter prize_id column from text to uuid in shipping_addresses table
    - Add foreign key constraint to dynamic_prizes table
    - Ensure proper relationship for admin panel queries

  2. Safety
    - Use IF EXISTS checks to prevent errors if constraints already exist
    - Handle data type conversion safely
*/

-- First, drop any existing foreign key constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'shipping_addresses' 
    AND constraint_name = 'fk_shipping_addresses_prize_id'
  ) THEN
    ALTER TABLE shipping_addresses DROP CONSTRAINT fk_shipping_addresses_prize_id;
  END IF;
END $$;

-- Convert prize_id column from text to uuid
-- This will only work if the existing text values are valid UUIDs
DO $$
BEGIN
  -- Check if column is already uuid type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shipping_addresses' 
    AND column_name = 'prize_id' 
    AND data_type = 'text'
  ) THEN
    -- Convert text to uuid
    ALTER TABLE shipping_addresses
    ALTER COLUMN prize_id TYPE uuid USING prize_id::uuid;
  END IF;
END $$;

-- Add foreign key constraint to dynamic_prizes table
DO $$
BEGIN
  -- Only add constraint if it doesn't already exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'shipping_addresses' 
    AND constraint_name = 'fk_shipping_addresses_prize_id'
  ) THEN
    ALTER TABLE shipping_addresses
    ADD CONSTRAINT fk_shipping_addresses_prize_id
    FOREIGN KEY (prize_id) REFERENCES dynamic_prizes(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for better query performance on the foreign key
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_prize_id 
ON shipping_addresses(prize_id);