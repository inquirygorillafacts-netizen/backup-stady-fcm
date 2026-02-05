'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { loadRazorpayScript, calculateFormFillingFee, formatCurrency } from '@/lib/razorpay';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

interface FormFillingServiceProps {
  jobId: string;
  jobTitle: string;
  category: string;
}

export default function FormFillingService({ jobId, jobTitle, category }: FormFillingServiceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  const amount = calculateFormFillingFee(category);

  const handlePayment = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert('कृपया सभी fields भरें');
      return;
    }

    setIsLoading(true);
    setPaymentStatus('processing');

    try {
      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      // Create order
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          jobId,
          jobTitle,
          userEmail: formData.email,
          userName: formData.name,
          userPhone: formData.phone,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error('Failed to create order');
      }

      // Initialize Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount * 100, // Convert to paise
        currency: orderData.currency,
        name: 'SarkariAlerts',
        description: `Form Filling Service - ${jobTitle}`,
        order_id: orderData.orderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#2563eb',
        },
        handler: async function (response: any) {
          // Verify payment
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              jobId,
              jobTitle,
              userEmail: formData.email,
              userName: formData.name,
              userPhone: formData.phone,
              amount,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            setPaymentStatus('success');
          } else {
            setPaymentStatus('failed');
          }
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
            setPaymentStatus('idle');
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      alert('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <CardTitle className="text-green-700">Payment Successful! 🎉</CardTitle>
          </div>
          <CardDescription className="text-green-600">
            आपका payment successfully complete हो गया है। हमारी team जल्द ही आपसे contact करेगी।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-green-700">
            <p>✅ Payment confirmed: {formatCurrency(amount)}</p>
            <p>✅ Confirmation email sent to: {formData.email}</p>
            <p>✅ हम 24 घंटे के अंदर आपसे संपर्क करेंगे</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Form Filling Service</span>
        </CardTitle>
        <CardDescription>
          हम आपके लिए यह form भर देंगे - बस {formatCurrency(amount)} में!
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showForm ? (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">क्या मिलेगा?</h4>
              <ul className="text-sm space-y-1">
                <li>✅ Complete form filling</li>
                <li>✅ Document upload</li>
                <li>✅ Expert verification</li>
                <li>✅ SMS/WhatsApp confirmation</li>
                <li>✅ 100% refund if form submit नहीं हुआ</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg text-center">
              <p className="text-2xl font-bold">{formatCurrency(amount)}</p>
              <p className="text-sm text-blue-100">One-time payment</p>
            </div>

            <Button 
              onClick={() => setShowForm(true)} 
              className="w-full"
              size="lg"
              data-testid="proceed-to-pay-button"
            >
              Proceed to Pay
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="आपका नाम"
                data-testid="payment-name-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="आपका email"
                data-testid="payment-email-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="आपका phone number"
                data-testid="payment-phone-input"
              />
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
                className="flex-1"
                data-testid="payment-back-button"
              >
                Back
              </Button>
              <Button
                onClick={handlePayment}
                disabled={isLoading}
                className="flex-1"
                data-testid="confirm-payment-button"
              >
                {isLoading ? 'Processing...' : `Pay ${formatCurrency(amount)}`}
              </Button>
            </div>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <p className="text-sm text-red-700">
              Payment failed. कृपया फिर से try करें या support से संपर्क करें।
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
