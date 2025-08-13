import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Mail, 
  FileText, 
  Users, 
  LogOut, 
  Save,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { EmailSettings, EmailTemplate, PaymentConfirmation } from '../types/admin';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('payments');
  const [payments, setPayments] = useState<PaymentConfirmation[]>([]);
  const [emailSettings, setEmailSettings] = useState<EmailSettings | null>(null);
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load payments
      const paymentsResponse = await fetch('/api/admin/payments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData);
      }

      // Load email settings
      const settingsResponse = await fetch('/api/admin/email-settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setEmailSettings(settingsData);
      }

      // Load email template
      const templateResponse = await fetch('/api/admin/email-template/payment_confirmation', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      if (templateResponse.ok) {
        const templateData = await templateResponse.json();
        setEmailTemplate(templateData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePaymentStatus = async (id: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/admin/payments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({ status, notes }),
      });

      if (response.ok) {
        toast.success('Payment status updated');
        loadData();
      }
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  const saveEmailSettings = async () => {
    if (!emailSettings) return;

    try {
      const response = await fetch('/api/admin/email-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify(emailSettings),
      });

      if (response.ok) {
        toast.success('Email settings saved');
      }
    } catch (error) {
      toast.error('Failed to save email settings');
    }
  };

  const saveEmailTemplate = async () => {
    if (!emailTemplate) return;

    try {
      const response = await fetch('/api/admin/email-template', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify(emailTemplate),
      });

      if (response.ok) {
        toast.success('Email template saved');
      }
    } catch (error) {
      toast.error('Failed to save email template');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage payment confirmations and settings</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'payments', name: 'Payment Confirmations', icon: Users },
              { id: 'email-settings', name: 'Email Settings', icon: Settings },
              { id: 'email-template', name: 'Email Template', icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Payment Confirmations Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Payment Confirmations</h3>
              <p className="text-sm text-gray-600">Review and manage payment submissions</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{payment.name}</div>
                          <div className="text-sm text-gray-500">{payment.email}</div>
                          <div className="text-sm text-gray-500">{payment.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">${payment.payment_amount}</div>
                          <div className="text-sm text-gray-500">Receipt: {payment.receipt_number}</div>
                          <div className="text-sm text-gray-500">{payment.courses}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(payment.status)}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => window.open(payment.receipt_file_url, '_blank')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => updatePaymentStatus(payment.id, 'verified')}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => updatePaymentStatus(payment.id, 'rejected')}
                          className="text-red-600 hover:text-red-900"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Email Settings Tab */}
        {activeTab === 'email-settings' && emailSettings && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900">Email Server Settings</h3>
              <p className="text-sm text-gray-600">Configure SMTP settings for sending emails</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">SMTP Host</label>
                <input
                  type="text"
                  value={emailSettings.smtp_host}
                  onChange={(e) => setEmailSettings({...emailSettings, smtp_host: e.target.value})}
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="form-label">SMTP Port</label>
                <input
                  type="number"
                  value={emailSettings.smtp_port}
                  onChange={(e) => setEmailSettings({...emailSettings, smtp_port: parseInt(e.target.value)})}
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="form-label">Username</label>
                <input
                  type="text"
                  value={emailSettings.smtp_username}
                  onChange={(e) => setEmailSettings({...emailSettings, smtp_username: e.target.value})}
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  value={emailSettings.smtp_password}
                  onChange={(e) => setEmailSettings({...emailSettings, smtp_password: e.target.value})}
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="form-label">From Email</label>
                <input
                  type="email"
                  value={emailSettings.from_email}
                  onChange={(e) => setEmailSettings({...emailSettings, from_email: e.target.value})}
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="form-label">From Name</label>
                <input
                  type="text"
                  value={emailSettings.from_name}
                  onChange={(e) => setEmailSettings({...emailSettings, from_name: e.target.value})}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={saveEmailSettings}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="h-5 w-5" />
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* Email Template Tab */}
        {activeTab === 'email-template' && emailTemplate && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900">Email Template</h3>
              <p className="text-sm text-gray-600">Customize the confirmation email sent to users</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="form-label">Subject Line</label>
                <input
                  type="text"
                  value={emailTemplate.subject}
                  onChange={(e) => setEmailTemplate({...emailTemplate, subject: e.target.value})}
                  className="form-input"
                  placeholder="Use {{name}}, {{receiptNumber}}, etc. for dynamic content"
                />
              </div>
              
              <div>
                <label className="form-label">HTML Content</label>
                <textarea
                  value={emailTemplate.html_content}
                  onChange={(e) => setEmailTemplate({...emailTemplate, html_content: e.target.value})}
                  className="form-input h-64 font-mono text-sm"
                  placeholder="HTML email template with {{variables}}"
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Available Variables:</h4>
                <div className="grid md:grid-cols-2 gap-2 text-sm text-blue-800">
                  <div><code>{'{{name}}'}</code> - Student name</div>
                  <div><code>{'{{email}}'}</code> - Student email</div>
                  <div><code>{'{{receiptNumber}}'}</code> - Receipt number</div>
                  <div><code>{'{{paymentAmount}}'}</code> - Payment amount</div>
                  <div><code>{'{{courses}}'}</code> - Course names</div>
                  <div><code>{'{{submissionDate}}'}</code> - Submission date</div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={saveEmailTemplate}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="h-5 w-5" />
                <span>Save Template</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}