export interface AdminUser {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface EmailSettings {
  id: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  text_content?: string;
  updated_at: string;
}

export interface PaymentConfirmation {
  id: string;
  name: string;
  phone: string;
  email: string;
  courses: string;
  receipt_number: string;
  payment_amount: number;
  receipt_file_url: string;
  status: 'pending' | 'verified' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
}