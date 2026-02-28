/*
  # Create User Features Tables

  1. New Tables
    - `user_addresses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `address_line_1` (text)
      - `address_line_2` (text)
      - `address_line_3` (text)
      - `address_line_4` (text)
      - `address_line_5` (text)
      - `flat_building_no` (text)
      - `nearest_location` (text)
      - `pincode` (text)
      - `city` (text)
      - `state` (text)
      - `country` (text)
      - `is_default` (boolean)
      - `created_at` (timestamp)
    
    - `liked_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `created_at` (timestamp)
    
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `heading` (text)
      - `message` (text)
      - `link` (text)
      - `is_read` (boolean)
      - `created_at` (timestamp)
    
    - `user_wallets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `wallet_address` (text)
      - `blockchain_name` (text)
      - `balance` (numeric)
      - `is_primary` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for user-specific access
*/

CREATE TABLE IF NOT EXISTS user_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  address_line_1 text,
  address_line_2 text,
  address_line_3 text,
  address_line_4 text,
  address_line_5 text,
  flat_building_no text,
  nearest_location text,
  pincode text,
  city text,
  state text,
  country text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS liked_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  heading text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  blockchain_name text NOT NULL DEFAULT 'Polygon',
  balance numeric DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add mobile_no column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'mobile_no'
  ) THEN
    ALTER TABLE users ADD COLUMN mobile_no text;
  END IF;
END $$;

ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE liked_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;

-- User addresses policies
CREATE POLICY "Users can manage their own addresses"
  ON user_addresses FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Liked items policies
CREATE POLICY "Users can manage their own liked items"
  ON liked_items FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User wallets policies
CREATE POLICY "Users can manage their own wallets"
  ON user_wallets FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);