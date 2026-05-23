'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, Trash2, Eye, X } from 'lucide-react';
import { api } from '../../lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

interface DocumentCardProps {
  docType: string;
  label: string;
  applicationId: string;
  existingDoc?: {
    id: string;
    status: string;
    fileName: string | null;
    ocrStatus: string;
    ocrError: string | null;
  } | null;
  onUploaded: () => void;
  onOcrComplete: (docType: string, extracted: Record<string, unknown>) => void;
}

interface OcrData {
  ocrStatus: string;
  ocrExtracted: Record<string, unknown> | null;
  ocrConfirmed: Record<string, unknown> | null;
  ocrError: string | null;
}

export function DocumentCard({
  docType,
  label,
  applicationId,
  existingDoc,
  onUploaded,
  onOcrComplete,
}: DocumentCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedDoc, setUploadedDoc] = useState(existingDoc || null);
  const [isDragging, setIsDragging] = useState(false);
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [ocrData, setOcrData] = useState<OcrData | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch OCR data for a document
  const fetchOcr = useCallback(async (docId: string) => {
    try {
      const data = await api<OcrData>(`/documents/${docId}/ocr`);
      setOcrData(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  // Start polling for OCR results
  const startPolling = useCallback((docId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    setIsPolling(true);

    pollRef.current = setInterval(async () => {
      const data = await fetchOcr(docId);
      if (data && (data.ocrStatus === 'done' || data.ocrStatus === 'failed' || data.ocrStatus === 'not_applicable')) {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
        setIsPolling(false);
        // Auto-show modal when OCR completes
        if (data.ocrStatus === 'done' && data.ocrExtracted) {
          setShowOcrModal(true);
        }
      }
    }, 3000);
  }, [fetchOcr]);

  // On mount: if doc exists, fetch OCR data. If pending, start polling.
  useEffect(() => {
    if (uploadedDoc?.id) {
      fetchOcr(uploadedDoc.id).then((data) => {
        if (data?.ocrStatus === 'pending') {
          startPolling(uploadedDoc.id);
        }
      });
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB');
      return;
    }
    if (!/\.(jpg|jpeg|png|pdf)$/i.test(file.name)) {
      setError('Only JPG, PNG, or PDF files are accepted');
      return;
    }

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('applicationId', applicationId);
    formData.append('documentType', docType);

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE}/documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(err.message);
      }

      const doc = await res.json();
      setUploadedDoc(doc);
      setOcrData(null);
      onUploaded();

      // Start polling for OCR
      if (doc.ocrStatus === 'pending') {
        startPolling(doc.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete() {
    if (!uploadedDoc) return;
    try {
      await api(`/documents/${uploadedDoc.id}`, { method: 'DELETE' });
      setUploadedDoc(null);
      setOcrData(null);
      if (pollRef.current) clearInterval(pollRef.current);
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  const currentOcrStatus = ocrData?.ocrStatus || uploadedDoc?.ocrStatus || 'pending';

  // If not uploaded yet — show dropzone
  if (!uploadedDoc) {
    return (
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
          isDragging
            ? 'border-brand-500 bg-brand-50'
            : 'border-surface-300 hover:border-brand-400 hover:bg-brand-50/50'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {isUploading ? (
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-2" />
        ) : (
          <Upload className="w-8 h-8 text-surface-400 mb-2" />
        )}
        <p className="text-sm font-medium text-surface-700">{label}</p>
        <p className="text-xs text-surface-400 mt-1">
          {isUploading ? 'Uploading...' : 'Drag & drop or click to upload'}
        </p>
        <p className="text-xs text-surface-400">JPG, PNG, PDF — max 5MB</p>
        {error && <p className="text-xs text-error mt-2">{error}</p>}
      </div>
    );
  }

  // Uploaded state
  return (
    <div className="border border-surface-200 rounded-xl p-4 bg-white">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            currentOcrStatus === 'done' ? 'bg-success/10' :
            currentOcrStatus === 'failed' ? 'bg-error/10' :
            currentOcrStatus === 'pending' ? 'bg-warning/10' :
            'bg-surface-100'
          }`}>
            {currentOcrStatus === 'done' ? <CheckCircle2 className="w-5 h-5 text-success" /> :
             currentOcrStatus === 'failed' ? <AlertCircle className="w-5 h-5 text-error" /> :
             currentOcrStatus === 'pending' || isPolling ? <Loader2 className="w-5 h-5 text-warning animate-spin" /> :
             <FileText className="w-5 h-5 text-surface-500" />}
          </div>
          <div>
            <p className="text-sm font-medium text-surface-800">{label}</p>
            <p className="text-xs text-surface-400">{uploadedDoc.fileName || 'Uploaded'}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {currentOcrStatus === 'done' && (
            <button
              onClick={() => {
                if (ocrData?.ocrExtracted) {
                  setShowOcrModal(true);
                } else {
                  // Fetch fresh data then show modal
                  fetchOcr(uploadedDoc.id).then((d) => {
                    if (d?.ocrExtracted) setShowOcrModal(true);
                  });
                }
              }}
              className="p-1.5 text-brand-500 hover:bg-brand-50 rounded-lg transition-colors cursor-pointer"
              title="View extracted data"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          {uploadedDoc.status !== 'verified' && (
            <button
              onClick={handleDelete}
              className="p-1.5 text-surface-400 hover:text-error hover:bg-error/5 rounded-lg transition-colors cursor-pointer"
              title="Remove"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-3 flex items-center gap-2">
        <StatusBadge ocrStatus={currentOcrStatus} docStatus={uploadedDoc.status} confirmed={!!ocrData?.ocrConfirmed} />
        {currentOcrStatus === 'pending' && isPolling && (
          <span className="text-xs text-surface-400">Processing OCR...</span>
        )}
        {currentOcrStatus === 'done' && !ocrData?.ocrConfirmed && (
          <button
            onClick={() => {
              if (ocrData?.ocrExtracted) {
                setShowOcrModal(true);
              } else {
                fetchOcr(uploadedDoc.id).then((d) => {
                  if (d?.ocrExtracted) setShowOcrModal(true);
                });
              }
            }}
            className="text-xs text-brand-500 hover:text-brand-600 font-medium cursor-pointer"
          >
            Review & confirm extracted data →
          </button>
        )}
      </div>

      {/* OCR Error */}
      {currentOcrStatus === 'failed' && (ocrData?.ocrError || uploadedDoc.ocrError) && (
        <div className="mt-3 bg-error/5 border border-error/10 rounded-lg px-3 py-2">
          <p className="text-xs text-error">{ocrData?.ocrError || uploadedDoc.ocrError}</p>
          <p className="text-xs text-surface-500 mt-1">You can enter the details manually in the form.</p>
        </div>
      )}

      {/* Replace option */}
      {uploadedDoc.status !== 'verified' && (
        <div className="mt-3">
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="text-xs text-brand-500 hover:text-brand-600 font-medium cursor-pointer"
          >
            Replace file
          </button>
        </div>
      )}

      {error && <p className="text-xs text-error mt-2">{error}</p>}

      {/* OCR Modal */}
      {showOcrModal && ocrData?.ocrExtracted && (
        <OcrModal
          label={label}
          extracted={ocrData.ocrExtracted}
          onClose={() => setShowOcrModal(false)}
          onConfirm={async (confirmed) => {
            await api(`/documents/${uploadedDoc.id}/confirm-ocr`, {
              method: 'PATCH',
              body: JSON.stringify({ confirmedData: confirmed }),
            });
            setOcrData({ ...ocrData, ocrConfirmed: confirmed });
            onOcrComplete(docType, confirmed);
            setShowOcrModal(false);
          }}
        />
      )}
    </div>
  );
}

function StatusBadge({ ocrStatus, docStatus, confirmed }: { ocrStatus: string; docStatus: string; confirmed: boolean }) {
  if (docStatus === 'verified') return <Badge text="Verified" color="success" />;
  if (docStatus === 'rejected') return <Badge text="Rejected" color="error" />;
  if (confirmed) return <Badge text="Data Confirmed ✓" color="success" />;
  if (ocrStatus === 'done') return <Badge text="OCR Complete — Review needed" color="warning" />;
  if (ocrStatus === 'failed') return <Badge text="OCR Failed" color="error" />;
  if (ocrStatus === 'pending') return <Badge text="Processing" color="warning" />;
  return <Badge text="Uploaded" color="info" />;
}

function Badge({ text, color }: { text: string; color: 'success' | 'error' | 'warning' | 'info' }) {
  const colors = {
    success: 'text-success bg-success/10',
    error: 'text-error bg-error/10',
    warning: 'text-warning bg-warning/10',
    info: 'text-blue-600 bg-blue-50',
  };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[color]}`}>{text}</span>;
}

function OcrModal({
  label,
  extracted,
  onClose,
  onConfirm,
}: {
  label: string;
  extracted: Record<string, unknown>;
  onClose: () => void;
  onConfirm: (data: Record<string, unknown>) => void;
}) {
  const [fields, setFields] = useState<Record<string, unknown>>({ ...extracted });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Friendly field labels
  const fieldLabels: Record<string, string> = {
    name: 'Full Name',
    dob: 'Date of Birth',
    registerNo: 'Register Number',
    percentage: 'Percentage',
    board: 'Board',
    year: 'Year of Passing',
    physics: 'Physics Marks',
    chemistry: 'Chemistry Marks',
    maths: 'Mathematics Marks',
    cetNumber: 'CET Number',
    rank: 'Rank',
    categoryRank: 'Category Rank',
    comedkNumber: 'COMEDK Number',
    gender: 'Gender',
    aadhaarLast4: 'Aadhaar (last 4)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-surface-200">
          <div>
            <h3 className="text-lg font-semibold text-surface-900">Extracted Data</h3>
            <p className="text-sm text-surface-500">{label}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-surface-100 rounded-lg cursor-pointer">
            <X className="w-5 h-5 text-surface-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-brand-50 border border-brand-200 rounded-lg px-3 py-2">
            <p className="text-xs text-brand-700">
              ✨ Review the extracted data below. Edit any incorrect values, then click <strong>Confirm & Auto-fill</strong> to populate your form.
            </p>
          </div>
          {Object.entries(fields).map(([key, value]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-surface-600 mb-1">
                {fieldLabels[key] || key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input
                value={String(value ?? '')}
                onChange={(e) => setFields({ ...fields, [key]: e.target.value })}
                className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 p-5 border-t border-surface-200">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-surface-200 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-50 cursor-pointer"
          >
            I'll enter manually
          </button>
          <button
            onClick={async () => {
              setIsSubmitting(true);
              await onConfirm(fields);
              setIsSubmitting(false);
            }}
            disabled={isSubmitting}
            className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Confirm & Auto-fill
          </button>
        </div>
      </div>
    </div>
  );
}
