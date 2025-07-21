/*
  # Add Free Tier Support to Dynamic Prizes

  1. Schema Changes
    - Update tier CHECK constraint to include 'free' tier
    - Add index for free tier queries
    - Update RLS policies to handle free tier

  2. Security
    - Maintain existing RLS policies
    - Ensure free tier prizes are accessible to all users

  3. Performance
    - Add optimized indexes for price range queries
*/

-- Update the tier CHECK constraint to include 'free'
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'dynamic_prizes' 
    AND constraint_name = 'dynamic_prizes_tier_check'
  ) THEN
    ALTER TABLE dynamic_prizes DROP CONSTRAINT dynamic_prizes_tier_check;
    RAISE NOTICE 'Dropped existing tier check constraint';
  END IF;

  -- Add new constraint that includes 'free' tier
  ALTER TABLE dynamic_prizes
  ADD CONSTRAINT dynamic_prizes_tier_check
  CHECK (tier IN ('free', 'bronze', 'silver', 'gold', 'sapphire', 'diamond'));
  
  RAISE NOTICE 'Added new tier check constraint with free tier support';
END $$;

-- Add index for free tier queries
CREATE INDEX IF NOT EXISTS idx_dynamic_prizes_free_tier_active 
ON dynamic_prizes(tier, is_active, price_usd) 
WHERE tier = 'free';

-- Add index for price range queries across all tiers
CREATE INDEX IF NOT EXISTS idx_dynamic_prizes_price_range 
ON dynamic_prizes(price_usd, tier, is_active) 
WHERE is_active = true;

-- Update RLS policy for free tier access (users should be able to see free tier prizes)
DO $$
BEGIN
  -- Drop existing read policy to recreate it
  DROP POLICY IF EXISTS "Anyone can read active dynamic prizes" ON dynamic_prizes;
  
  -- Create new policy that explicitly allows free tier access
  CREATE POLICY "Anyone can read active dynamic prizes"
    ON dynamic_prizes
    FOR SELECT
    TO authenticated
    USING (is_active = true);
    
  RAISE NOTICE 'Updated RLS policy to support free tier access';
END $$;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully:';
  RAISE NOTICE '  - Added free tier support to dynamic_prizes table';
  RAISE NOTICE '  - Updated CHECK constraint to include free tier';
  RAISE NOTICE '  - Added optimized indexes for price range queries';
  RAISE NOTICE '  - Updated RLS policies for free tier access';
END $$;