'use client';

import { useState, ReactNode } from 'react';
import { Check, ChevronLeft, ChevronRight, CloudUpload, Loader2 } from 'lucide-react';

const STEPS = [
  { number: 1, title: 'Personal Info' },
  { number: 2, title: 'Academics' },
  { number: 3, title: 'Entrance Exam' },
  { number: 4, title: 'Documents' },
  { number: 5, title: 'Review' },
];

interface FormShellProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  skipStep3?: boolean;
  isSaving?: boolean;
  lastSaved?: string | null;
  children: ReactNode;
}

export function FormShell({
  currentStep,
  onStepChange,
  skipStep3 = false,
  isSaving = false,
  lastSaved,
  children,
}: FormShellProps) {
  const activeSteps = skipStep3 ? STEPS.filter(s => s.number !== 3) : STEPS;
  const maxStep = skipStep3 ? 5 : 5;

  function goNext() {
    let next = currentStep + 1;
    if (skipStep3 && next === 3) next = 4;
    if (next <= maxStep) onStepChange(next);
  }

  function goPrev() {
    let prev = currentStep - 1;
    if (skipStep3 && prev === 3) prev = 2;
    if (prev >= 1) onStepChange(prev);
  }

  return (
    <div className="animate-fade-in">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {activeSteps.map((step, index) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;
            return (
              <div key={step.number} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => onStepChange(step.number)}
                  className={`flex flex-col items-center gap-1.5 group cursor-pointer`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      isCompleted
                        ? 'bg-success text-white shadow-lg shadow-success/25'
                        : isActive
                          ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30 ring-4 ring-brand-500/20'
                          : 'bg-surface-200 text-surface-500 group-hover:bg-surface-300'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : step.number}
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${
                      isActive ? 'text-brand-600' : isCompleted ? 'text-success' : 'text-surface-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </button>

                {/* Connector line */}
                {index < activeSteps.length - 1 && (
                  <div className="flex-1 mx-3 mt-[-18px]">
                    <div className={`h-0.5 rounded-full transition-all duration-500 ${
                      step.number < currentStep ? 'bg-success' : 'bg-surface-200'
                    }`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Status */}
      <div className="flex items-center justify-end mb-4 h-5">
        {isSaving && (
          <div className="flex items-center gap-1.5 text-xs text-surface-400 animate-fade-in">
            <Loader2 className="w-3 h-3 animate-spin" />
            Saving...
          </div>
        )}
        {!isSaving && lastSaved && (
          <div className="flex items-center gap-1.5 text-xs text-success animate-fade-in">
            <CloudUpload className="w-3 h-3" />
            Saved {new Date(lastSaved).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6 sm:p-8 min-h-[400px]">
        {children}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={goPrev}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-surface-600 bg-white border border-surface-200 rounded-xl hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {currentStep < 5 ? (
          <button
            onClick={goNext}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-all shadow-sm shadow-brand-500/25 cursor-pointer"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
