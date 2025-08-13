/*
  # Add email field and admin system

  1. Changes to existing tables
    - Add email field to payment_confirmations table
  
  2. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `name` (text)
      - `created_at` (timestamp)
    
    - `email_settings`
      - `id` (uuid, primary key)
      - `smtp_host` (text)
      - `smtp_port` (integer)
      - `smtp_username` (text)
      - `smtp_password` (text)
      - `from_email` (text)
      - `from_name` (text)
      - `updated_at` (timestamp)
    
    - `email_templates`
      - `id` (uuid, primary key)
      - `name` (text)
      - `subject` (text)
      - `html_content` (text)
      - `text_content` (text)
      - `updated_at` (timestamp)

  3. Security
    - Enable RLS on all new tables
    - Add policies for admin access
*/

-- Add email field to payment_confirmations if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payment_confirmations' AND column_name = 'email'
  ) THEN
    ALTER TABLE payment_confirmations ADD COLUMN email text;
  END IF;
END $$;

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create email_settings table
CREATE TABLE IF NOT EXISTS email_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  smtp_host text NOT NULL DEFAULT 'smtp.resend.com',
  smtp_port integer NOT NULL DEFAULT 587,
  smtp_username text NOT NULL DEFAULT 'resend',
  smtp_password text NOT NULL,
  from_email text NOT NULL,
  from_name text NOT NULL DEFAULT 'EduPay Portal',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  subject text NOT NULL,
  html_content text NOT NULL,
  text_content text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Insert default email template
INSERT INTO email_templates (name, subject, html_content, text_content)
VALUES (
  'payment_confirmation',
  'Payment Confirmation Received - {{name}}',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmation - EduPay Portal</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Confirmation Received</h1>
      <p>Thank you for submitting your payment details</p>
    </div>
    
    <div class="content">
      <p>Dear {{name}},</p>
      
      <p>We have successfully received your payment confirmation for course enrollment. Your submission is now being processed by our team.</p>
      
      <div class="details">
        <h3>Payment Details:</h3>
        <p><strong>Receipt Number:</strong> {{receiptNumber}}</p>
        <p><strong>Payment Amount:</strong> ${{paymentAmount}}</p>
        <p><strong>Courses:</strong> {{courses}}</p>
        <p><strong>Submission Date:</strong> {{submissionDate}}</p>
      </div>
      
      <h3>What happens next?</h3>
      <ul>
        <li>Our team will verify your payment within 1-2 business days</li>
        <li>You will receive course access information via email</li>
        <li>If there are any issues, we will contact you directly</li>
      </ul>
      
      <p>If you have any questions or concerns, please don''t hesitate to contact our support team.</p>
      
      <div class="footer">
        <p>Best regards,<br>EduPay Portal Team</p>
        <p>Support: support@edupay.com | +1-800-123-4567</p>
      </div>
    </div>
  </div>
</body>
</html>',
  'Dear {{name}},

We have successfully received your payment confirmation for course enrollment.

Payment Details:
- Receipt Number: {{receiptNumber}}
- Payment Amount: ${{paymentAmount}}
- Courses: {{courses}}
- Submission Date: {{submissionDate}}

What happens next?
- Our team will verify your payment within 1-2 business days
- You will receive course access information via email
- If there are any issues, we will contact you directly

Best regards,
EduPay Portal Team
Support: support@edupay.com | +1-800-123-4567'
) ON CONFLICT (name) DO NOTHING;

-- RLS Policies for admin_users
CREATE POLICY "Admin users can read own data"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = email);

-- RLS Policies for email_settings
CREATE POLICY "Admin users can manage email settings"
  ON email_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- RLS Policies for email_templates
CREATE POLICY "Admin users can manage email templates"
  ON email_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Create default admin user (password: admin123)
INSERT INTO admin_users (email, password_hash, name)
VALUES (
  'admin@edupay.com',
  '$2a$10$rOvHPGkwQGKqvzjo.6.5..5YvdLxKfM5kFjBVVqzQGKqvzjo.6.5.e',
  'System Administrator'
) ON CONFLICT (email) DO NOTHING;