import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import PaymentForm from './components/PaymentForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { GraduationCap, Shield, Mail } from 'lucide-react';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setAdminToken(token);
      setIsAdmin(true);
    }
  }, []);

  const handleAdminLogin = (token: string) => {
    setAdminToken(token);
    setIsAdmin(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_token');
    setAdminToken(null);
    setIsAdmin(false);
  };

  // Check if current path is admin
  const isAdminPath = window.location.pathname.startsWith('/admin');

  if (isAdminPath) {
    if (!isAdmin) {
      return <AdminLogin onLogin={handleAdminLogin} />;
    }
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          },
        }}
      />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">EduPay Portal</h1>
              <p className="text-sm text-gray-600">Secure payment confirmation system</p>
            </div>
            <div className="ml-auto">
              <a
                href="/admin"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Admin Login
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Confirm Your Course Payment
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete your enrollment by submitting your payment confirmation details. 
            We'll verify your payment and send you course access information.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Safe</h3>
            <p className="text-gray-600">Your payment information is encrypted and stored securely</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Confirmation</h3>
            <p className="text-gray-600">Receive instant confirmation and receipt via email</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Access</h3>
            <p className="text-gray-600">Get course access within 1-2 business days</p>
          </div>
        </div>

        {/* Payment Form */}
        <PaymentForm />

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
            <p className="text-gray-600">
              If you encounter any issues or have questions about your payment, 
              please contact our support team at{' '}
              <a href="mailto:support@edupay.com" className="text-blue-600 hover:text-blue-700">
                support@edupay.com
              </a>{' '}
              or call{' '}
              <a href="tel:+1-800-123-4567" className="text-blue-600 hover:text-blue-700">
                +1-800-123-4567
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;