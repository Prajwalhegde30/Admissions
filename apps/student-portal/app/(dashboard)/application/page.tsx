'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApplication } from '../../../hooks/useApplication';
import { useAutoSave } from '../../../hooks/useAutoSave';
import { FormShell } from '../../../components/form/FormShell';
import { PersonalInfoStep } from '../../../components/form/steps/PersonalInfoStep';
import { AcademicStep } from '../../../components/form/steps/AcademicStep';
import { EntranceExamStep } from '../../../components/form/steps/EntranceExamStep';
import { DocumentsStep } from '../../../components/form/steps/DocumentsStep';
import { ReviewStep } from '../../../components/form/steps/ReviewStep';
import { getFormVisibility, type AdmissionType, type StudentCategory, type BoardType } from '../../../lib/form-rules';
import { Loader2, CheckCircle2, PartyPopper } from 'lucide-react';

export default function ApplicationPage() {
  const { application, profile, isLoading, error, getFormValue, updateFormData, refetch } = useApplication();
  const { save, isSaving, lastSaved } = useAutoSave();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  // Derive admission params from formData (or defaults)
  const admissionType = (getFormValue('academic.admissionType') || application?.admissionType || 'kcet') as AdmissionType;
  const category = (getFormValue('academic.category') || application?.category || 'general') as StudentCategory;
  const boardType = (getFormValue('academic.boardType') || 'karnataka_state') as BoardType;

  const visibility = getFormVisibility(admissionType, category, boardType);

  // Auto-save handler for individual field changes
  const handleFieldChange = useCallback((fieldPath: string, value: unknown) => {
    updateFormData(fieldPath, value);
    save(fieldPath, value);
  }, [updateFormData, save]);

  // Handlers for the three adaptive selectors
  const handleAdmissionTypeChange = useCallback((type: AdmissionType) => {
    handleFieldChange('academic.admissionType', type);
  }, [handleFieldChange]);

  const handleCategoryChange = useCallback((cat: StudentCategory) => {
    handleFieldChange('academic.category', cat);
  }, [handleFieldChange]);

  const handleBoardTypeChange = useCallback((board: BoardType) => {
    handleFieldChange('academic.boardType', board);
  }, [handleFieldChange]);

  // OCR auto-fill handler — maps confirmed OCR data to form fields
  const handleOcrAutoFill = useCallback((docType: string, extracted: Record<string, unknown>) => {
    const fieldMappings: Record<string, Record<string, string>> = {
      marks_card_10th: {
        name: 'personal.ocrName',
        dob: 'personal.dateOfBirth',
        registerNo: 'academic.tenthRegisterNo',
        percentage: 'academic.tenthPercentage',
        board: 'academic.tenthBoard',
      },
      marks_card_12th: {
        name: 'personal.ocrName12th',
        registerNo: 'academic.twelfthRegisterNo',
        percentage: 'academic.twelfthPercentage',
        board: 'academic.twelfthBoard',
        year: 'academic.twelfthYear',
        physics: 'academic.twelfthPhysics',
        chemistry: 'academic.twelfthChemistry',
        maths: 'academic.twelfthMaths',
      },
      kcet_rank_card: {
        cetNumber: 'entrance.cetNumber',
        rank: 'entrance.cetRank',
        categoryRank: 'entrance.cetCategoryRank',
      },
      comedk_rank_card: {
        comedkNumber: 'entrance.comedkNumber',
        rank: 'entrance.comedkRank',
      },
      aadhaar: {
        name: 'personal.ocrNameAadhaar',
        dob: 'personal.dateOfBirth',
        gender: 'personal.gender',
      },
    };

    const mapping = fieldMappings[docType];
    if (!mapping) return;

    for (const [ocrKey, formPath] of Object.entries(mapping)) {
      const value = extracted[ocrKey];
      if (value !== undefined && value !== null && value !== '') {
        handleFieldChange(formPath, value);
      }
    }
  }, [handleFieldChange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-error font-medium mb-2">Failed to load application</p>
        <p className="text-sm text-surface-500 mb-4">{error}</p>
        <button onClick={refetch} className="px-4 py-2 bg-brand-500 text-white text-sm rounded-lg cursor-pointer">Retry</button>
      </div>
    );
  }

  if (application?.status === 'submitted' || isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
          <PartyPopper className="w-10 h-10 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-surface-900 mb-2">Application Submitted!</h2>
        <p className="text-surface-500 max-w-md mb-8">
          Your application has been submitted successfully. You'll receive email notifications as it progresses through review.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 text-success text-sm font-medium rounded-full">
          <CheckCircle2 className="w-4 h-4" />
          Submitted on {application?.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : 'just now'}
        </div>
      </div>
    );
  }

  function renderStep() {
    switch (currentStep) {
      case 1:
        return (
          <DocumentsStep
            admissionType={admissionType}
            category={category}
            boardType={boardType}
            applicationId={application?.id || ''}
            onOcrAutoFill={handleOcrAutoFill}
          />
        );
      case 2:
        return (
          <PersonalInfoStep
            getFormValue={getFormValue}
            onFieldChange={handleFieldChange}
            firstName={profile?.user.firstName}
            lastName={profile?.user.lastName}
          />
        );
      case 3:
        return (
          <AcademicStep
            getFormValue={getFormValue}
            onFieldChange={handleFieldChange}
            admissionType={admissionType}
            category={category}
            boardType={boardType}
            onAdmissionTypeChange={handleAdmissionTypeChange}
            onCategoryChange={handleCategoryChange}
            onBoardTypeChange={handleBoardTypeChange}
          />
        );
      case 4:
        return (
          <EntranceExamStep
            admissionType={admissionType}
            getFormValue={getFormValue}
            onFieldChange={handleFieldChange}
          />
        );
      case 5:
        return (
          <ReviewStep
            getFormValue={getFormValue}
            admissionType={admissionType}
            category={category}
            boardType={boardType}
            firstName={profile?.user.firstName}
            lastName={profile?.user.lastName}
            onStepChange={setCurrentStep}
            onSubmitted={() => {
              setIsSubmitted(true);
              refetch();
            }}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Your Application</h1>
        <p className="text-surface-500 text-sm mt-1">Complete all steps to submit your admission application</p>
      </div>

      <FormShell
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        skipStep3={!visibility.showEntranceExamStep}
        isSaving={isSaving}
        lastSaved={lastSaved}
      >
        {renderStep()}
      </FormShell>
    </div>
  );
}
