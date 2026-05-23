'use client';

import { BookOpen } from 'lucide-react';
import type { AdmissionType, StudentCategory, BoardType } from '../../../lib/form-rules';

interface AcademicStepProps {
  getFormValue: <T = string>(path: string, defaultValue?: T) => T;
  onFieldChange: (path: string, value: unknown) => void;
  admissionType: AdmissionType;
  category: StudentCategory;
  boardType: BoardType;
  onAdmissionTypeChange: (type: AdmissionType) => void;
  onCategoryChange: (cat: StudentCategory) => void;
  onBoardTypeChange: (board: BoardType) => void;
}

export function AcademicStep({
  getFormValue,
  onFieldChange,
  admissionType,
  category,
  boardType,
  onAdmissionTypeChange,
  onCategoryChange,
  onBoardTypeChange,
}: AcademicStepProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-brand-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-surface-900">Academic Background</h2>
          <p className="text-sm text-surface-500">Your educational details and admission preferences</p>
        </div>
      </div>

      {/* Admission Type + Category + Board */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <label htmlFor="admission-type" className="block text-sm font-medium text-surface-700 mb-1.5">
            Admission Type <span className="text-error">*</span>
          </label>
          <select
            id="admission-type"
            value={admissionType}
            onChange={(e) => onAdmissionTypeChange(e.target.value as AdmissionType)}
            className="w-full px-3 py-2.5 bg-brand-50 border-2 border-brand-200 rounded-xl text-surface-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all appearance-none cursor-pointer"
          >
            <option value="kcet">KCET</option>
            <option value="comedk">COMEDK</option>
            <option value="management">Management</option>
          </select>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-surface-700 mb-1.5">
            Category <span className="text-error">*</span>
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as StudentCategory)}
            className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all appearance-none cursor-pointer"
          >
            <option value="general">General</option>
            <option value="sc">SC</option>
            <option value="st">ST</option>
            <option value="obc">OBC</option>
            <option value="ph">PH (Persons with Disability)</option>
          </select>
        </div>

        <div>
          <label htmlFor="board-type" className="block text-sm font-medium text-surface-700 mb-1.5">
            Board <span className="text-error">*</span>
          </label>
          <select
            id="board-type"
            value={boardType}
            onChange={(e) => onBoardTypeChange(e.target.value as BoardType)}
            className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all appearance-none cursor-pointer"
          >
            <option value="karnataka_state">Karnataka State Board</option>
            <option value="cbse">CBSE</option>
            <option value="icse">ICSE</option>
            <option value="other">Other State Board</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="preferred-branch" className="block text-sm font-medium text-surface-700 mb-1.5">Preferred Branch</label>
        <select
          id="preferred-branch"
          value={getFormValue('academic.preferredBranch')}
          onChange={(e) => onFieldChange('academic.preferredBranch', e.target.value)}
          className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all appearance-none cursor-pointer"
        >
          <option value="">Select branch</option>
          <option value="cse">Computer Science & Engineering</option>
          <option value="ise">Information Science & Engineering</option>
          <option value="ece">Electronics & Communication</option>
          <option value="eee">Electrical & Electronics</option>
          <option value="me">Mechanical Engineering</option>
          <option value="ce">Civil Engineering</option>
          <option value="aiml">AI & Machine Learning</option>
          <option value="ds">Data Science</option>
        </select>
      </div>

      {/* 10th Details */}
      <div className="border-t border-surface-100 pt-6">
        <h3 className="text-sm font-semibold text-surface-700 mb-4">10th Standard Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <AcField id="tenth-school" label="School Name" value={getFormValue('academic.tenthSchool')} onChange={(v) => onFieldChange('academic.tenthSchool', v)} placeholder="e.g. DPS Bangalore" />
          <AcField id="tenth-board" label="Board" value={getFormValue('academic.tenthBoard')} onChange={(v) => onFieldChange('academic.tenthBoard', v)} placeholder="e.g. CBSE" />
          <AcField id="tenth-year" label="Year of Passing" type="number" value={getFormValue('academic.tenthYear')} onChange={(v) => onFieldChange('academic.tenthYear', v)} placeholder="2020" />
          <AcField id="tenth-percentage" label="Percentage" type="number" value={getFormValue('academic.tenthPercentage')} onChange={(v) => onFieldChange('academic.tenthPercentage', v)} placeholder="90.5" />
          <AcField id="tenth-register" label="Register Number" value={getFormValue('academic.tenthRegisterNo')} onChange={(v) => onFieldChange('academic.tenthRegisterNo', v)} placeholder="KA1234567" />
        </div>
      </div>

      {/* 12th Details */}
      <div className="border-t border-surface-100 pt-6">
        <h3 className="text-sm font-semibold text-surface-700 mb-4">12th Standard / PUC Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <AcField id="twelfth-school" label="School / College" value={getFormValue('academic.twelfthSchool')} onChange={(v) => onFieldChange('academic.twelfthSchool', v)} placeholder="e.g. RV PU College" />
          <AcField id="twelfth-board" label="Board" value={getFormValue('academic.twelfthBoard')} onChange={(v) => onFieldChange('academic.twelfthBoard', v)} placeholder="e.g. Karnataka State" />
          <AcField id="twelfth-year" label="Year of Passing" type="number" value={getFormValue('academic.twelfthYear')} onChange={(v) => onFieldChange('academic.twelfthYear', v)} placeholder="2022" />
          <AcField id="twelfth-percentage" label="Percentage" type="number" value={getFormValue('academic.twelfthPercentage')} onChange={(v) => onFieldChange('academic.twelfthPercentage', v)} placeholder="88.0" />
          <AcField id="twelfth-register" label="Register Number" value={getFormValue('academic.twelfthRegisterNo')} onChange={(v) => onFieldChange('academic.twelfthRegisterNo', v)} placeholder="KA2345678" />
        </div>
        <h4 className="text-xs font-semibold text-surface-500 mt-5 mb-3 uppercase tracking-wide">PCM Subject Marks</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <AcField id="twelfth-physics" label="Physics" type="number" value={getFormValue('academic.twelfthPhysics')} onChange={(v) => onFieldChange('academic.twelfthPhysics', v)} placeholder="95" />
          <AcField id="twelfth-chemistry" label="Chemistry" type="number" value={getFormValue('academic.twelfthChemistry')} onChange={(v) => onFieldChange('academic.twelfthChemistry', v)} placeholder="90" />
          <AcField id="twelfth-maths" label="Mathematics" type="number" value={getFormValue('academic.twelfthMaths')} onChange={(v) => onFieldChange('academic.twelfthMaths', v)} placeholder="92" />
        </div>
      </div>
    </div>
  );
}

function AcField({ id, label, value, onChange, type = 'text', placeholder }: { id: string; label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-surface-700 mb-1.5">{label}</label>
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} onBlur={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all hover:border-surface-300" />
    </div>
  );
}
