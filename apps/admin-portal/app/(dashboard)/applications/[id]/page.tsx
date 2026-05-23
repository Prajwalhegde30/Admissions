'use client';

import { useState, useEffect } from 'react';
import { api, API_BASE } from '../../../../lib/api';
import { ChevronLeft, CheckCircle, XCircle, AlertCircle, FileText, Check } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function ApplicationReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeDoc, setActiveDoc] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [docUrl, setDocUrl] = useState('');

  useEffect(() => {
    async function fetchApp() {
      try {
        const res = await api<any>(`/applications/${id}`);
        setApp(res);
        if (res.documents?.length > 0) {
          setActiveDoc(res.documents[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchApp();
  }, [id]);

  useEffect(() => {
    if (activeDoc) {
      api<any>(`/documents/${activeDoc.id}/url`).then(res => setDocUrl(res.url)).catch(() => setDocUrl(''));
    }
  }, [activeDoc]);

  async function handleDocAction(action: 'verify' | 'reject') {
    try {
      const reason = action === 'reject' ? prompt('Enter rejection reason:') : undefined;
      if (action === 'reject' && !reason) return;
      
      const res = await api<any>(`/documents/${activeDoc.id}/${action}`, {
        method: 'PATCH',
        body: JSON.stringify({ reason })
      });
      
      // Update doc in state
      setApp((prev: any) => ({
        ...prev,
        documents: prev.documents.map((d: any) => d.id === activeDoc.id ? res : d)
      }));
      setActiveDoc(res);
    } catch (err) {
      alert('Action failed');
    }
  }

  async function handleAppReview(status: 'approved' | 'rejected') {
    setReviewing(true);
    try {
      await api(`/applications/${id}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes })
      });
      router.push('/applications');
    } catch (err) {
      alert('Review failed');
      setReviewing(false);
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!app) return <div className="p-8 text-center">Application not found</div>;

  const fallback = (profile: any, formDataObj: any) => {
    const result = { ...formDataObj };
    if (profile) {
      for (const key in profile) {
        if (profile[key] !== null && profile[key] !== undefined) {
          result[key] = profile[key];
        }
      }
    }
    return result;
  };

  const profile = fallback(app.profile, app.formData?.personal);
  const academic = fallback(app.profile, app.formData?.academic);
  
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/applications" className="p-2 hover:bg-surface-200 rounded-lg text-surface-500">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-surface-900">
              Review: {app.student.firstName} {app.student.lastName}
            </h1>
            <p className="text-sm text-surface-500">{app.student.email}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handleAppReview('rejected')}
            disabled={reviewing}
            className="px-4 py-2 border border-error text-error rounded-lg hover:bg-error/5 font-medium"
          >
            Reject Application
          </button>
          <button 
            onClick={() => handleAppReview('approved')}
            disabled={reviewing}
            className="px-4 py-2 bg-success hover:bg-success/90 text-white rounded-lg font-medium"
          >
            Approve Application
          </button>
        </div>
      </div>

      <div className="flex gap-6 min-h-0 flex-1">
        {/* Left Col: Form Data */}
        <div className="w-1/3 bg-white border border-surface-200 rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-surface-200 bg-surface-50 font-medium text-surface-900 shrink-0">
            Application Data
          </div>
          <div className="p-4 overflow-y-auto space-y-6">
            
            {app.validationWarnings?.length > 0 && (
              <div className="bg-warning/10 border border-warning/20 p-4 rounded-lg space-y-2">
                <h3 className="text-sm font-bold text-warning-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Validation Warnings
                </h3>
                <ul className="list-disc pl-5 text-sm text-warning-700">
                  {app.validationWarnings.map((warning: string, i: number) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">Profile</h3>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-3"><span className="text-surface-500">Admn Type</span><span className="col-span-2 font-medium">{app.admissionType}</span></div>
                <div className="grid grid-cols-3"><span className="text-surface-500">Category</span><span className="col-span-2 font-medium">{app.category}</span></div>
                <div className="grid grid-cols-3"><span className="text-surface-500">Gender</span><span className="col-span-2 font-medium">{profile.gender}</span></div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">10th Details</h3>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-3"><span className="text-surface-500">Board</span><span className="col-span-2 font-medium">{academic.tenthBoard}</span></div>
                <div className="grid grid-cols-3"><span className="text-surface-500">Reg No</span><span className="col-span-2 font-medium">{academic.tenthRegisterNo}</span></div>
                <div className="grid grid-cols-3"><span className="text-surface-500">Percentage</span><span className="col-span-2 font-medium">{academic.tenthPercentage ? `${academic.tenthPercentage}%` : ''}</span></div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">12th / PUC Details</h3>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-3"><span className="text-surface-500">Board</span><span className="col-span-2 font-medium">{academic.twelfthBoard}</span></div>
                <div className="grid grid-cols-3"><span className="text-surface-500">Physics</span><span className="col-span-2 font-medium">{academic.twelfthPhysics}</span></div>
                <div className="grid grid-cols-3"><span className="text-surface-500">Maths</span><span className="col-span-2 font-medium">{academic.twelfthMaths}</span></div>
                <div className="grid grid-cols-3"><span className="text-surface-500">Chemistry</span><span className="col-span-2 font-medium">{academic.twelfthChemistry}</span></div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">Admin Notes</h3>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add private review notes..."
                className="w-full p-3 text-sm border border-surface-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Right Col: Documents */}
        <div className="w-2/3 bg-white border border-surface-200 rounded-xl flex flex-col overflow-hidden">
          <div className="border-b border-surface-200 bg-surface-50 flex shrink-0 overflow-x-auto">
            {app.documents?.map((doc: any) => (
              <button
                key={doc.id}
                onClick={() => setActiveDoc(doc)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeDoc?.id === doc.id ? 'border-brand-500 text-brand-600 bg-white' : 'border-transparent text-surface-500 hover:text-surface-700 hover:bg-surface-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  {doc.status === 'verified' && <CheckCircle className="w-4 h-4 text-success" />}
                  {doc.status === 'rejected' && <XCircle className="w-4 h-4 text-error" />}
                  {doc.status === 'pending' && <AlertCircle className="w-4 h-4 text-warning" />}
                  {doc.documentType.replace(/_/g, ' ')}
                </div>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-4 flex flex-col lg:flex-row gap-4 bg-surface-100/50">
            {activeDoc ? (
              <>
                <div className="flex-1 bg-surface-100 border border-surface-200 rounded-lg flex items-center justify-center overflow-hidden relative">
                  {docUrl ? (
                    <img src={docUrl.startsWith('/v1') ? docUrl.replace('/v1', API_BASE) : docUrl} alt="Document" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="text-surface-400 flex flex-col items-center">
                      <FileText className="w-12 h-12 mb-2" />
                      <p>Document preview not available</p>
                    </div>
                  )}
                </div>
                <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
                  <div className="bg-white border border-surface-200 rounded-lg p-4">
                    <h4 className="font-semibold text-surface-900 mb-3">Document Status</h4>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDocAction('verify')}
                        disabled={activeDoc.status === 'verified'}
                        className={`flex-1 py-2 rounded-lg font-medium text-sm border flex items-center justify-center gap-2 ${activeDoc.status === 'verified' ? 'bg-success/10 text-success border-success/20' : 'border-surface-200 hover:bg-surface-50 text-surface-700'}`}
                      >
                        <Check className="w-4 h-4" /> Verify
                      </button>
                      <button 
                        onClick={() => handleDocAction('reject')}
                        className={`flex-1 py-2 rounded-lg font-medium text-sm border flex items-center justify-center gap-2 ${activeDoc.status === 'rejected' ? 'bg-error/10 text-error border-error/20' : 'border-surface-200 hover:bg-surface-50 text-surface-700'}`}
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                    {activeDoc.rejectionReason && (
                      <div className="mt-3 p-3 bg-error/10 text-error text-xs rounded-lg border border-error/20">
                        <strong>Reason:</strong> {activeDoc.rejectionReason}
                      </div>
                    )}
                  </div>

                  {activeDoc.ocrConfirmed && (
                    <div className="bg-white border border-surface-200 rounded-lg p-4 flex-1 overflow-auto">
                      <h4 className="font-semibold text-surface-900 mb-3 flex items-center gap-2">
                         <CheckCircle className="w-4 h-4 text-brand-500" />
                         Extracted OCR Data
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(activeDoc.ocrConfirmed).map(([k, v]) => (
                          <div key={k}>
                            <p className="text-xs text-surface-500 uppercase tracking-wide">{k.replace(/([A-Z])/g, ' $1').trim()}</p>
                            <p className="text-sm font-medium text-surface-900">{String(v)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-surface-500">
                Select a document to view
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
