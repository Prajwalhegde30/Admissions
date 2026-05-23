'use client';

import { Trophy, Ban } from 'lucide-react';
import type { AdmissionType } from '../../../lib/form-rules';

interface EntranceExamStepProps {
  admissionType: AdmissionType;
  getFormValue: <T = string>(path: string, defaultValue?: T) => T;
  onFieldChange: (path: string, value: unknown) => void;
}

export function EntranceExamStep({ admissionType, getFormValue, onFieldChange }: EntranceExamStepProps) {
  if (admissionType === 'management') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center mb-4">
          <Ban className="w-8 h-8 text-surface-400" />
        </div>
        <h2 className="text-lg font-semibold text-surface-700 mb-2">Not Applicable</h2>
        <p className="text-sm text-surface-500 max-w-sm">
          Entrance exam details are not required for Management quota admissions. You can proceed to the next step.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
          <Trophy className="w-4 h-4 text-brand-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-surface-900">
            {admissionType === 'kcet' ? 'KCET Details' : 'COMEDK Details'}
          </h2>
          <p className="text-sm text-surface-500">
            {admissionType === 'kcet'
              ? 'Your Karnataka Common Entrance Test details'
              : 'Your COMEDK UGET details'}
          </p>
        </div>
      </div>

      {/* Admission type badge */}
      <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
        admissionType === 'kcet' 
          ? 'bg-blue-50 text-blue-700 border border-blue-200'
          : 'bg-purple-50 text-purple-700 border border-purple-200'
      }`}>
        {admissionType === 'kcet' ? '🎯 KCET Admission' : '🎯 COMEDK Admission'}
      </div>

      {admissionType === 'kcet' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <ExField id="cet-number" label="CET Number" value={getFormValue('entrance.cetNumber')} onChange={(v) => onFieldChange('entrance.cetNumber', v)} placeholder="10-digit CET number" />
          <ExField id="cet-rank" label="CET Rank" type="number" value={getFormValue('entrance.cetRank')} onChange={(v) => onFieldChange('entrance.cetRank', v)} placeholder="e.g. 5000" />
          <ExField id="cet-category-rank" label="CET Category Rank" type="number" value={getFormValue('entrance.cetCategoryRank')} onChange={(v) => onFieldChange('entrance.cetCategoryRank', v)} placeholder="e.g. 1200" />
        </div>
      )}

      {admissionType === 'comedk' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <ExField id="comedk-number" label="COMEDK Number" value={getFormValue('entrance.comedkNumber')} onChange={(v) => onFieldChange('entrance.comedkNumber', v)} placeholder="COMEDK application number" />
          <ExField id="comedk-rank" label="COMEDK Rank" type="number" value={getFormValue('entrance.comedkRank')} onChange={(v) => onFieldChange('entrance.comedkRank', v)} placeholder="e.g. 8000" />
        </div>
      )}
    </div>
  );
}

function ExField({ id, label, value, onChange, type = 'text', placeholder }: { id: string; label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-surface-700 mb-1.5">{label}</label>
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} onBlur={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all hover:border-surface-300" />
    </div>
  );
}
