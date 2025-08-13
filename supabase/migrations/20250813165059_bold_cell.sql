/*
  # Payment Confirmation System Schema

  1. New Tables
    - `payment_confirmations`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `phone` (text, required)
      - `courses` (text, required)
      - `receipt_number` (text, required)
      - `payment_amount` (numeric, required)
      - `receipt_file_url` (text, required)
      - `email` (text, optional)
      - `status` (text, default: 'pending')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `payment_confirmations` table
    - Add policy for public insert access (form submissions)
    - Add policy for authenticated admin access

  3. Storage
    - Create storage bucket for payment receipts
    - Set up public read access for receipts
*/

-- Create payment_confirmations table
CREATE TABLE IF NOT EXISTS payment_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  courses text NOT NULL,
  receipt_number text NOT NULL,
  payment_amount numeric(10,2) NOT NULL,
  receipt_file_url text NOT NULL,
  email text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_confirmations ENABLE ROW LEVEL SECURITY;

-- Policy for public form submissions
CREATE POLICY "Anyone can submit payment confirmations"
  ON payment_confirmations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy for authenticated users to read all records
CREATE POLICY "Authenticated users can read payment confirmations"
  ON payment_confirmations
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for authenticated users to update records
CREATE POLICY "Authenticated users can update payment confirmations"
  ON payment_confirmations
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_confirmations_updated_at
  BEFORE UPDATE ON payment_confirmations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for public upload
CREATE POLICY "Anyone can upload payment receipts"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'payment-receipts');

-- Storage policy for public read
CREATE POLICY "Anyone can read payment receipts"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'payment-receipts');