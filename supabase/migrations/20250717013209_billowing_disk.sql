/*
  # Update crack history schema for new prize flows

  1. Schema Changes
    - Add `type` column to distinguish between 'free' and 'premium' cracks
    - Add `prize_data` column to store complete prize information as JSON
    - Add `premium_tier` column for premium cookie tiers
    - Update existing columns to be more flexible

  2. Data Migration
    - Update existing records to have type 'free'
    - Ensure backward compatibility

  3. Indexes
    - Add index on type and premium_tier for efficient queries
*/

-- Add new columns to crack_history table
DO $$
BEGIN
  -- Add type column (free/premium)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crack_history' AND column_name = 'type'
  ) THEN
    ALTER TABLE crack_history ADD COLUMN type text DEFAULT 'free';
  END IF;

  -- Add prize_data column for storing complete prize information
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crack_history' AND column_name = 'prize_data'
  ) THEN
    ALTER TABLE crack_history ADD COLUMN prize_data jsonb;
  END IF;

  -- Add premium_tier column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crack_history' AND column_name = 'premium_tier'
  ) THEN
    ALTER TABLE crack_history ADD COLUMN premium_tier text;
  END IF;
END $$;

-- Add check constraint for type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'crack_history' AND constraint_name = 'crack_history_type_check'
  ) THEN
    ALTER TABLE crack_history ADD CONSTRAINT crack_history_type_check 
    CHECK (type IN ('free', 'premium'));
  END IF;
END $$;

-- Add check constraint for premium_tier
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'crack_history' AND constraint_name = 'crack_history_premium_tier_check'
  ) THEN
    ALTER TABLE crack_history ADD CONSTRAINT crack_history_premium_tier_check 
    CHECK (premium_tier IN ('bronze', 'silver', 'gold', 'sapphire', 'diamond') OR premium_tier IS NULL);
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_crack_history_type 
ON crack_history (type);

CREATE INDEX IF NOT EXISTS idx_crack_history_premium_tier 
ON crack_history (premium_tier) 
WHERE premium_tier IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_crack_history_type_user_created 
ON crack_history (type, user_id, created_at DESC);

-- Update existing records to have type 'free' if not already set
UPDATE crack_history 
SET type = 'free' 
WHERE type IS NULL;

-- Make type column NOT NULL after setting defaults
ALTER TABLE crack_history ALTER COLUMN type SET NOT NULL;