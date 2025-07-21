/*
  # Safe conversion of shipping_addresses.prize_id to UUID with foreign key

  1. Data Cleanup
    - Handle existing non-UUID values in prize_id column
    - Convert valid UUIDs and set invalid ones to NULL
    
  2. Schema Changes
    - Convert prize_id column from text to uuid
    - Add foreign key constraint to dynamic_prizes table
    
  3. Performance
    - Add index on foreign key for better query performance
*/

-- Step 1: Clean up existing data that cannot be converted to UUID
DO $$
BEGIN
  -- First, let's see what we're dealing with and clean up invalid UUIDs
  -- Set invalid UUID values to NULL so the conversion can proceed
  UPDATE shipping_addresses 
  SET prize_id = NULL 
  WHERE prize_id IS NOT NULL 
  AND NOT (
    prize_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    OR prize_id ~ '^[0-9a-f]{32}$'
  );
  
  RAISE NOTICE 'Cleaned up invalid prize_id values in shipping_addresses';
END $$;

-- Step 2: Convert the column type from text to uuid
DO $$
BEGIN
  -- Check if column is still text type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shipping_addresses' 
    AND column_name = 'prize_id' 
    AND data_type = 'text'
  ) THEN
    -- Convert text to uuid, invalid values should now be NULL
    ALTER TABLE shipping_addresses
    ALTER COLUMN prize_id TYPE uuid USING 
      CASE 
        WHEN prize_id IS NULL THEN NULL
        WHEN prize_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN prize_id::uuid
        WHEN prize_id ~ '^[0-9a-f]{32}$' THEN 
          (SUBSTRING(prize_id, 1, 8) || '-' || 
           SUBSTRING(prize_id, 9, 4) || '-' || 
           SUBSTRING(prize_id, 13, 4) || '-' || 
           SUBSTRING(prize_id, 17, 4) || '-' || 
           SUBSTRING(prize_id, 21, 12))::uuid
        ELSE NULL
      END;
    
    RAISE NOTICE 'Successfully converted prize_id column to uuid type';
  ELSE
    RAISE NOTICE 'prize_id column is already uuid type';
  END IF;
END $$;

-- Step 3: Add foreign key constraint to dynamic_prizes table
DO $$
BEGIN
  -- Drop any existing foreign key constraint first
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'shipping_addresses' 
    AND constraint_name = 'fk_shipping_addresses_prize_id'
  ) THEN
    ALTER TABLE shipping_addresses DROP CONSTRAINT fk_shipping_addresses_prize_id;
    RAISE NOTICE 'Dropped existing foreign key constraint';
  END IF;

  -- Add the new foreign key constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'shipping_addresses' 
    AND constraint_name = 'fk_shipping_addresses_prize_id'
  ) THEN
    ALTER TABLE shipping_addresses
    ADD CONSTRAINT fk_shipping_addresses_prize_id
    FOREIGN KEY (prize_id) REFERENCES dynamic_prizes(id) ON DELETE SET NULL;
    
    RAISE NOTICE 'Added foreign key constraint to dynamic_prizes';
  END IF;
END $$;

-- Step 4: Create index for better query performance on the foreign key
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_prize_id 
ON shipping_addresses(prize_id)
WHERE prize_id IS NOT NULL;

-- Step 5: Report on the cleanup
DO $$
DECLARE
  total_records INTEGER;
  null_prize_ids INTEGER;
  valid_prize_ids INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_records FROM shipping_addresses;
  SELECT COUNT(*) INTO null_prize_ids FROM shipping_addresses WHERE prize_id IS NULL;
  SELECT COUNT(*) INTO valid_prize_ids FROM shipping_addresses WHERE prize_id IS NOT NULL;
  
  RAISE NOTICE 'Migration completed:';
  RAISE NOTICE '  Total shipping_addresses records: %', total_records;
  RAISE NOTICE '  Records with NULL prize_id: %', null_prize_ids;
  RAISE NOTICE '  Records with valid prize_id: %', valid_prize_ids;
END $$;