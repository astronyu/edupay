export interface PaymentFormData {
  name: string;
  phone: string;
  email: string;
  courses: string;
  receiptNumber: string;
  paymentAmount: number;
  paymentReceipt: File | null;
}

export interface FormErrors {
  [key: string]: string;
}