'use client';

import { useState } from 'react';
import { ClipboardCheck, Send, Loader2, Edit3 } from 'lucide-react';
import { api } from '../../../lib/api';

interface Props {
  getFormValue: <T = string>(path: string, defaultValue?: T) => T;
  admissionType: string;
  category: string;
  boardType: string;
  firstName?: string;
  lastName?: string;
  onStepChange: (step: number) => void;
  onSubmitted: () => void;
}

export function ReviewStep({ getFormValue, admissionType, category, boardType, firstName, lastName, onStepChange, onSubmitted }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError('');
    try {
      await api('/applications/mine/submit', {
        method: 'POST',
        body: JSON.stringify({ admissionType, category }),
      });
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
          <ClipboardCheck className="w-4 h-4 text-brand-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-surface-900">Review & Submit</h2>
          <p className="text-sm text-surface-500">Please verify all information before submitting</p>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Personal Info Summary */}
      <Section title="Personal Information" onEdit={() => onStepChange(1)}>
        <Row label="Name" value={`${firstName || ''} ${lastName || ''}`} />
        <Row label="Date of Birth" value={getFormValue('personal.dateOfBirth')} />
        <Row label="Gender" value={getFormValue('personal.gender')} />
        <Row label="Father's Name" value={getFormValue('personal.fatherName')} />
        <Row label="Mother's Name" value={getFormValue('personal.motherName')} />
        <Row label="Phone" value={getFormValue('personal.guardianPhone')} />
        <Row label="City" value={getFormValue('personal.city')} />
        <Row label="State" value={getFormValue('personal.state')} />
      </Section>

      {/* Academic Summary */}
      <Section title="Academic Background" onEdit={() => onStepChange(2)}>
        <Row label="Admission Type" value={admissionType.toUpperCase()} />
        <Row label="Category" value={category.toUpperCase()} />
        <Row label="Board" value={boardType.replace('_', ' ')} />
        <Row label="10th %" value={getFormValue('academic.tenthPercentage')} />
        <Row label="12th %" value={getFormValue('academic.twelfthPercentage')} />
        <Row label="Preferred Branch" value={getFormValue('academic.preferredBranch')} />
      </Section>

      {/* Entrance Exam Summary */}
      {admissionType !== 'management' && (
        <Section title="Entrance Exam" onEdit={() => onStepChange(3)}>
          {admissionType === 'kcet' && (
            <>
              <Row label="CET Number" value={getFormValue('entrance.cetNumber')} />
              <Row label="CET Rank" value={getFormValue('entrance.cetRank')} />
            </>
          )}
          {admissionType === 'comedk' && (
            <>
              <Row label="COMEDK Number" value={getFormValue('entrance.comedkNumber')} />
              <Row label="COMEDK Rank" value={getFormValue('entrance.comedkRank')} />
            </>
          )}
        </Section>
      )}

      {/* Submit */}
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          Submit Application
        </button>
      ) : (
        <div className="bg-warning/5 border border-warning/20 rounded-xl p-5 space-y-4">
          <p className="text-sm font-medium text-surface-800">
            Are you sure? Once submitted, you cannot modify your application.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 border border-surface-200 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-50 cursor-pointer">Cancel</button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isSubmitting ? 'Submitting...' : 'Confirm Submit'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="border border-surface-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-surface-50 border-b border-surface-200">
        <h3 className="text-sm font-semibold text-surface-700">{title}</h3>
        <button onClick={onEdit} className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 font-medium cursor-pointer">
          <Edit3 className="w-3 h-3" /> Edit
        </button>
      </div>
      <div className="divide-y divide-surface-100">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between px-4 py-2.5">
      <span className="text-xs text-surface-500">{label}</span>
      <span className="text-sm font-medium text-surface-800">{value || '—'}</span>
    </div>
  );
}
