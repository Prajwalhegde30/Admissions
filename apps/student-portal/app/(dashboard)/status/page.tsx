'use client';

import { useState } from 'react';
import { useApplication } from '../../../hooks/useApplication';
import { Loader2, Clock, CheckCircle2, FileText, AlertCircle, CreditCard } from 'lucide-react';
import { api } from '../../../lib/api';

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Draft', color: 'text-surface-500 bg-surface-100', icon: <FileText className="w-4 h-4" /> },
  payment_pending: { label: 'Payment Pending', color: 'text-warning bg-warning/10', icon: <Clock className="w-4 h-4" /> },
  paid: { label: 'Paid', color: 'text-success bg-success/10', icon: <CheckCircle2 className="w-4 h-4" /> },
  submitted: { label: 'Submitted', color: 'text-blue-700 bg-blue-50', icon: <CheckCircle2 className="w-4 h-4" /> },
  under_review: { label: 'Under Review', color: 'text-blue-700 bg-blue-50', icon: <Clock className="w-4 h-4" /> },
  approved: { label: 'Approved', color: 'text-success bg-success/10', icon: <CheckCircle2 className="w-4 h-4" /> },
  rejected: { label: 'Rejected', color: 'text-error bg-error/10', icon: <AlertCircle className="w-4 h-4" /> },
};

export default function StatusPage() {
  const { application, isLoading, mutate } = useApplication();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!application) return;
    setIsProcessing(true);

    try {
      const orderData: any = await api('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ applicationId: application.id }),
      });

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Atria Institute',
        description: 'Application Fee',
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            await api('/payments/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            mutate();
          } catch (err) {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: `${(application as any).formData?.personal?.firstName || ''} ${(application as any).formData?.personal?.lastName || ''}`,
          email: '',
        },
        theme: {
          color: '#0055ff',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.message || 'Failed to initialize payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  const status = STATUS_MAP[application?.status || 'draft'] || STATUS_MAP.draft;

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-surface-900 mb-6">Application Status</h1>

      <div className="bg-white border border-surface-200 rounded-2xl p-8 text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${status.color}`}>
          {status.icon}
          {status.label}
        </div>

        {application?.status === 'payment_pending' && (
          <div className="mt-8 pt-8 border-t border-surface-100">
            <p className="text-surface-600 mb-4">
              To complete your submission and begin the review process, please pay the application fee of ₹500.
            </p>
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full btn-brand py-3 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pay Application Fee
                </>
              )}
            </button>
          </div>
        )}

        <div className="mt-8 space-y-3 text-sm pt-8 border-t border-surface-100 text-left">
          <div className="flex justify-between text-surface-500">
            <span>Application ID</span>
            <span className="font-mono text-surface-700">{application?.id?.slice(0, 8) || '—'}</span>
          </div>
          <div className="flex justify-between text-surface-500">
            <span>Created</span>
            <span className="text-surface-700">{application?.createdAt ? new Date(application.createdAt).toLocaleDateString() : '—'}</span>
          </div>
          {application?.submittedAt && (
            <div className="flex justify-between text-surface-500">
              <span>Submitted</span>
              <span className="text-surface-700">{new Date(application.submittedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
