/*
  # Fix shipping_addresses prize_id conversion with NOT NULL constraint handling

  1. Data Cleanup and Conversion
    - Temporarily drop NOT NULL constraint on prize_id
    - Clean up invalid UUID values by setting them to NULL
    - Convert column type from text to uuid
    - Add foreign key constraint to dynamic_prizes
    - Restore NOT NULL constraint if desired

  2. Safety
    - Handle existing invalid data gracefully
    - Provide detailed logging of changes
    - Use proper error handling
*/

-- Step 1: Drop NOT NULL constraint temporarily to allow cleanup
DO $$
BEGIN
  -- Check if column has NOT NULL constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shipping_addresses' 
    AND column_name = 'prize_id' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE shipping_addresses ALTER COLUMN prize_id DROP NOT NULL;
    RAISE NOTICE 'Dropped NOT NULL constraint on prize_id column';
  END IF;
END $$;

-- Step 2: Clean up existing data that cannot be converted to UUID
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  -- Count invalid records before cleanup
  SELECT COUNT(*) INTO invalid_count
  FROM shipping_addresses 
  WHERE prize_id IS NOT NULL 
  AND NOT (
    prize_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    OR prize_id ~ '^[0-9a-f]{32}$'
  );
  
  RAISE NOTICE 'Found % records with invalid prize_id values', invalid_count;
  
  -- Set invalid UUID values to NULL so the conversion can proceed
  UPDATE shipping_addresses 
  SET prize_id = NULL 
  WHERE prize_id IS NOT NULL 
  AND NOT (
    prize_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    OR prize_id ~ '^[0-9a-f]{32}$'
  );
  
  RAISE NOTICE 'Set % invalid prize_id values to NULL', invalid_count;
END $$;

-- Step 3: Convert the column type from text to uuid
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

-- Step 4: Add foreign key constraint to dynamic_prizes table
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

-- Step 5: Create index for better query performance on the foreign key
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_prize_id 
ON shipping_addresses(prize_id)
WHERE prize_id IS NOT NULL;

-- Step 6: Optional - Restore NOT NULL constraint if you want to enforce it
-- Uncomment the following block if you want prize_id to be required
/*
DO $$
BEGIN
  -- Only restore NOT NULL if all current records have valid prize_id values
  IF NOT EXISTS (
    SELECT 1 FROM shipping_addresses WHERE prize_id IS NULL
  ) THEN
    ALTER TABLE shipping_addresses ALTER COLUMN prize_id SET NOT NULL;
    RAISE NOTICE 'Restored NOT NULL constraint on prize_id column';
  ELSE
    RAISE NOTICE 'Cannot restore NOT NULL constraint - some records have NULL prize_id';
  END IF;
END $$;
*/

-- Step 7: Report on the final state
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
  RAISE NOTICE '  Foreign key constraint added to dynamic_prizes table';
END $$;