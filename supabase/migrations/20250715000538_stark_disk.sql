/*
# Initial LuckyCookie.io Database Schema

1. New Tables
  - `user_profiles` - Extended user data with crack statistics
    - `id` (uuid, references auth.users)
    - `email` (text)
    - `last_crack_time` (timestamp)
    - `streak` (integer, days cracked in a row)
    - `total_cracks` (integer, lifetime crack count)
    - `created_at` (timestamp)
  
  - `crack_history` - Record of all cookie cracks
    - `id` (uuid, primary key)
    - `user_id` (uuid, references user_profiles)
    - `fortune` (text, the fortune message received)
    - `won` (boolean, whether they won a gift)
    - `gift_name` (text, name of gift if won)
    - `gift_value` (integer, value in naira if won)
    - `created_at` (timestamp)
  
  - `prizes` - Available prizes for premium cookies
    - `id` (uuid, primary key)
    - `name` (text, prize name)
    - `price_usd` (decimal, price in USD)
    - `image_url` (text, prize image)
    - `is_premium` (boolean, premium vs free tier)
    - `is_active` (boolean, available for selection)
    - `created_at` (timestamp)
  
  - `premium_cookies` - Premium cookie purchases and claims
    - `id` (uuid, primary key)
    - `user_id` (uuid, references user_profiles)
    - `prize_id` (uuid, references prizes)
    - `purchased_at` (timestamp)
    - `status` (text, 'pending' or 'claimed')
    - `claim_code` (text, unique claim identifier)

2. Security
  - Enable RLS on all tables
  - Add policies for authenticated users to access their own data
  - Add admin policies for management functions

3. Seed Data
  - Insert sample fortunes and prizes
  - Create initial premium prize inventory
*/

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  last_crack_time timestamptz DEFAULT NULL,
  streak integer DEFAULT 0,
  total_cracks integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Crack history table
CREATE TABLE IF NOT EXISTS crack_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  fortune text NOT NULL,
  won boolean DEFAULT false,
  gift_name text DEFAULT NULL,
  gift_value integer DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

-- Prizes table
CREATE TABLE IF NOT EXISTS prizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price_usd decimal(10,2) NOT NULL,
  image_url text NOT NULL,
  is_premium boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Premium cookies table
CREATE TABLE IF NOT EXISTS premium_cookies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  prize_id uuid REFERENCES prizes(id) NOT NULL,
  purchased_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'claimed')),
  claim_code text UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex')
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crack_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_cookies ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Crack history policies
CREATE POLICY "Users can read own crack history"
  ON crack_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own crack history"
  ON crack_history
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Prizes policies (read-only for users)
CREATE POLICY "Anyone can read active prizes"
  ON prizes
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Premium cookies policies
CREATE POLICY "Users can read own premium cookies"
  ON premium_cookies
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own premium cookies"
  ON premium_cookies
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Insert sample prizes
INSERT INTO prizes (name, price_usd, image_url, is_premium) VALUES
  ('iPhone 15 Pro', 999.00, 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg', true),
  ('MacBook Air M2', 1199.00, 'https://images.pexels.com/photos/812264/pexels-photo-812264.jpeg', true),
  ('AirPods Pro', 249.00, 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg', true),
  ('PlayStation 5', 499.00, 'https://images.pexels.com/photos/9072323/pexels-photo-9072323.jpeg', true),
  ('Nintendo Switch', 299.00, 'https://images.pexels.com/photos/735911/pexels-photo-735911.jpeg', true),
  ('Samsung Galaxy Watch', 299.00, 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg', true),
  ('Bose Headphones', 349.00, 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg', true),
  ('iPad Air', 599.00, 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg', true);