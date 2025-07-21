-- Shipping addresses table
CREATE TABLE IF NOT EXISTS shipping_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  prize_id uuid REFERENCES dynamic_prizes(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address_line_1 text NOT NULL,
  address_line_2 text,
  city text NOT NULL,
  state_province text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL,
  special_instructions text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  tracking_number text,
  shipping_carrier text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Gumroad purchases table
CREATE TABLE IF NOT EXISTS gumroad_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  sale_id text UNIQUE NOT NULL,
  product_id text NOT NULL,
  product_name text NOT NULL,
  tier text NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'sapphire', 'diamond')),
  price_usd decimal(10,2) NOT NULL,
  email text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'cracked', 'shipped', 'completed')),
  purchase_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Dynamic prizes table (from AliExpress API)
CREATE TABLE IF NOT EXISTS dynamic_prizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier text NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'sapphire', 'diamond')),
  source text DEFAULT 'aliexpress' CHECK (source IN ('aliexpress', 'manual')),
  external_id text,
  name text NOT NULL,
  description text,
  image_url text NOT NULL,
  price_usd decimal(10,2) NOT NULL,
  affiliate_url text,
  commission_rate decimal(5,2),
  is_active boolean DEFAULT true,
  stock_status text DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by text
);

-- Webhook logs table
CREATE TABLE IF NOT EXISTS webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE gumroad_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Shipping addresses policies
CREATE POLICY "Users can read own shipping addresses"
  ON shipping_addresses
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own shipping addresses"
  ON shipping_addresses
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own shipping addresses"
  ON shipping_addresses
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Gumroad purchases policies
CREATE POLICY "Users can read own purchases"
  ON gumroad_purchases
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own purchases"
  ON gumroad_purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Dynamic prizes policies (read-only for users)
CREATE POLICY "Anyone can read active dynamic prizes"
  ON dynamic_prizes
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admin settings policies (admin only)
CREATE POLICY "Admin can manage settings"
  ON admin_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND email IN ('admin@luckycookie.io', 'support@luckycookie.io')
    )
  );

-- Webhook logs policies (admin only)
CREATE POLICY "Admin can read webhook logs"
  ON webhook_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND email IN ('admin@luckycookie.io', 'support@luckycookie.io')
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user_status ON shipping_addresses(user_id, status);
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_status_created ON shipping_addresses(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gumroad_purchases_user_status ON gumroad_purchases(user_id, status);
CREATE INDEX IF NOT EXISTS idx_gumroad_purchases_sale_id ON gumroad_purchases(sale_id);
CREATE INDEX IF NOT EXISTS idx_gumroad_purchases_tier_status ON gumroad_purchases(tier, status);
CREATE INDEX IF NOT EXISTS idx_dynamic_prizes_tier_active ON dynamic_prizes(tier, is_active);
CREATE INDEX IF NOT EXISTS idx_dynamic_prizes_source_active ON dynamic_prizes(source, is_active);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_source_processed ON webhook_logs(source, processed);
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);

-- Insert default admin settings
INSERT INTO admin_settings (key, value, description) VALUES
  ('app_name', '"LuckyCookie.io"', 'Application name'),
  ('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
  ('free_crack_cooldown_hours', '1', 'Hours between free cookie cracks'),
  ('max_daily_cracks', '24', 'Maximum free cracks per day'),
  ('aliexpress_sync_enabled', 'true', 'Enable AliExpress product sync'),
  ('gumroad_webhook_enabled', 'true', 'Enable Gumroad webhook processing'),
  ('shipping_enabled_countries', '["United States", "Canada", "United Kingdom", "Australia", "Germany", "France"]', 'Countries where shipping is available'),
  ('admin_emails', '["admin@luckycookie.io", "support@luckycookie.io"]', 'Admin email addresses')
ON CONFLICT (key) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_shipping_addresses_updated_at
  BEFORE UPDATE ON shipping_addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gumroad_purchases_updated_at
  BEFORE UPDATE ON gumroad_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dynamic_prizes_updated_at
  BEFORE UPDATE ON dynamic_prizes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
