import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Upload, FileText, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { PaymentFormData } from '../types/form';

const paymentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Please enter a valid email address'),
  courses: z.string().min(3, 'Please specify the courses'),
  receiptNumber: z.string().min(3, 'Receipt number is required'),
  paymentAmount: z.number().min(1, 'Payment amount must be greater than 0'),
});

export default function PaymentForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<Omit<PaymentFormData, 'paymentReceipt'>>({
    resolver: zodResolver(paymentSchema),
  });

  const watchedAmount = watch('paymentAmount');

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Please upload a valid image (JPEG, PNG) or PDF file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setFile(selectedFile);
      toast.success('Receipt uploaded successfully!');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileChange(droppedFile);
  };

  const onSubmit = async (data: Omit<PaymentFormData, 'paymentReceipt'>) => {
    if (!file) {
      toast.error('Please upload a payment receipt');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('phone', data.phone);
      formData.append('email', data.email);
      formData.append('courses', data.courses);
      formData.append('receiptNumber', data.receiptNumber);
      formData.append('paymentAmount', data.paymentAmount.toString());
      formData.append('paymentReceipt', file);

      // Here we would submit to our Supabase edge function
      // For now, we'll simulate the submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Payment confirmation submitted successfully!');
      setIsSubmitted(true);
      
      // Reset form after successful submission
      reset();
      setFile(null);
      
      // Show success state for 3 seconds then reset
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);

    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit payment confirmation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
          <p className="text-gray-600">
            Your payment confirmation has been submitted successfully. 
            You will receive an acknowledgment email shortly.
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            <strong>What's next?</strong><br />
            • Check your email for confirmation<br />
            • Your payment details have been recorded<br />
            • Our team will process your submission
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
        <h1 className="text-2xl font-bold text-white mb-2">Payment Confirmation</h1>
        <p className="text-blue-100">Submit your payment details for course enrollment</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="form-field">
            <label htmlFor="name" className="form-label">
              Full Name *
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className={`form-input ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="form-error">{errors.name.message}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="phone" className="form-label">
              Phone Number *
            </label>
            <input
              id="phone"
              type="tel"
              {...register('phone')}
              className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
              placeholder="Enter your phone number"
            />
            {errors.phone && (
              <p className="form-error">{errors.phone.message}</p>
            )}
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="email" className="form-label">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className={`form-input ${errors.email ? 'border-red-500' : ''}`}
            placeholder="Enter your email address"
          />
          {errors.email && (
            <p className="form-error">{errors.email.message}</p>
          )}
        </div>
        <div className="form-field">
          <label htmlFor="courses" className="form-label">
            Courses *
          </label>
          <input
            id="courses"
            type="text"
            {...register('courses')}
            className={`form-input ${errors.courses ? 'border-red-500' : ''}`}
            placeholder="Enter course names (e.g., React Development, Node.js Fundamentals)"
          />
          {errors.courses && (
            <p className="form-error">{errors.courses.message}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="form-field">
            <label htmlFor="receiptNumber" className="form-label">
              Receipt Number *
            </label>
            <input
              id="receiptNumber"
              type="text"
              {...register('receiptNumber')}
              className={`form-input ${errors.receiptNumber ? 'border-red-500' : ''}`}
              placeholder="Enter receipt/transaction number"
            />
            {errors.receiptNumber && (
              <p className="form-error">{errors.receiptNumber.message}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="paymentAmount" className="form-label">
              Payment Amount (USD) *
            </label>
            <input
              id="paymentAmount"
              type="number"
              step="0.01"
              {...register('paymentAmount', { valueAsNumber: true })}
              className={`form-input ${errors.paymentAmount ? 'border-red-500' : ''}`}
              placeholder="0.00"
            />
            {errors.paymentAmount && (
              <p className="form-error">{errors.paymentAmount.message}</p>
            )}
            {watchedAmount > 0 && (
              <p className="text-sm text-green-600 mt-1">
                Amount: ${watchedAmount?.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">
            Payment Receipt *
          </label>
          <div
            className={`upload-zone ${isDragOver ? 'active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              className="hidden"
            />
            
            {file ? (
              <div className="flex items-center justify-center space-x-3">
                <FileText className="h-8 w-8 text-green-500" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            ) : (
              <div>
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, or PDF (max 5MB)
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Important Information:</p>
              <ul className="space-y-1">
                <li>• All fields marked with * are required</li>
                <li>• Upload a clear image or PDF of your payment receipt</li>
                <li>• You will receive an email confirmation after submission</li>
                <li>• Processing typically takes 1-2 business days</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Submit Payment Confirmation</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}