'use client';

import { User, MapPin } from 'lucide-react';

interface PersonalInfoStepProps {
  getFormValue: <T = string>(path: string, defaultValue?: T) => T;
  onFieldChange: (path: string, value: unknown) => void;
  firstName?: string;
  lastName?: string;
}

export function PersonalInfoStep({ getFormValue, onFieldChange, firstName, lastName }: PersonalInfoStepProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
          <User className="w-4 h-4 text-brand-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-surface-900">Personal Information</h2>
          <p className="text-sm text-surface-500">Basic details about you</p>
        </div>
      </div>

      {/* Name — read only from invite */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="First Name" readOnly value={firstName || ''} id="personal-firstName" />
        <FormField label="Last Name" readOnly value={lastName || ''} id="personal-lastName" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField
          label="Date of Birth"
          type="date"
          value={getFormValue('personal.dateOfBirth')}
          onChange={(v) => onFieldChange('personal.dateOfBirth', v)}
          id="personal-dob"
        />
        <div>
          <label htmlFor="personal-gender" className="block text-sm font-medium text-surface-700 mb-1.5">Gender</label>
          <select
            id="personal-gender"
            value={getFormValue('personal.gender')}
            onChange={(e) => onFieldChange('personal.gender', e.target.value)}
            onBlur={(e) => onFieldChange('personal.gender', e.target.value)}
            className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all appearance-none cursor-pointer"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Parent/Guardian Info */}
      <div className="border-t border-surface-100 pt-6">
        <h3 className="text-sm font-semibold text-surface-700 mb-4">Parent / Guardian Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            label="Father's Name"
            value={getFormValue('personal.fatherName')}
            onChange={(v) => onFieldChange('personal.fatherName', v)}
            id="personal-fatherName"
            placeholder="Enter father's full name"
          />
          <FormField
            label="Mother's Name"
            value={getFormValue('personal.motherName')}
            onChange={(v) => onFieldChange('personal.motherName', v)}
            id="personal-motherName"
            placeholder="Enter mother's full name"
          />
        </div>
        <div className="mt-5">
          <FormField
            label="Guardian Phone"
            type="tel"
            value={getFormValue('personal.guardianPhone')}
            onChange={(v) => onFieldChange('personal.guardianPhone', v)}
            id="personal-guardianPhone"
            placeholder="+91 98765 43210"
          />
        </div>
      </div>

      {/* Address */}
      <div className="border-t border-surface-100 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-surface-400" />
          <h3 className="text-sm font-semibold text-surface-700">Address</h3>
        </div>
        <div className="space-y-5">
          <FormField
            label="Address Line 1"
            value={getFormValue('personal.addressLine1')}
            onChange={(v) => onFieldChange('personal.addressLine1', v)}
            id="personal-addressLine1"
            placeholder="House/Building number, Street"
          />
          <FormField
            label="Address Line 2"
            value={getFormValue('personal.addressLine2')}
            onChange={(v) => onFieldChange('personal.addressLine2', v)}
            id="personal-addressLine2"
            placeholder="Area, Landmark (optional)"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <FormField
              label="City"
              value={getFormValue('personal.city')}
              onChange={(v) => onFieldChange('personal.city', v)}
              id="personal-city"
              placeholder="City"
            />
            <FormField
              label="State"
              value={getFormValue('personal.state')}
              onChange={(v) => onFieldChange('personal.state', v)}
              id="personal-state"
              placeholder="State"
            />
            <FormField
              label="Pincode"
              value={getFormValue('personal.pincode')}
              onChange={(v) => onFieldChange('personal.pincode', v)}
              id="personal-pincode"
              placeholder="560024"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reusable Form Field Component ──────────────────────────────────────────

interface FormFieldProps {
  label: string;
  id: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
}

function FormField({ label, id, value, onChange, type = 'text', placeholder, readOnly }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-surface-700 mb-1.5">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
          readOnly
            ? 'bg-surface-100 border-surface-200 text-surface-500 cursor-not-allowed'
            : 'bg-surface-50 border-surface-200 text-surface-900 hover:border-surface-300'
        }`}
      />
    </div>
  );
}
