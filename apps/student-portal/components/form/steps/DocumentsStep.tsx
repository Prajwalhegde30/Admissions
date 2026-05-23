'use client';

import { useState, useEffect } from 'react';
import { FileCheck, AlertCircle } from 'lucide-react';
import { getRequiredDocuments, type AdmissionType, type StudentCategory, type BoardType } from '../../../lib/form-rules';
import { DocumentCard } from '../DocumentCard';
import { api } from '../../../lib/api';

interface ExistingDoc {
  id: string;
  documentType: string;
  status: string;
  fileName: string | null;
  ocrStatus: string;
  ocrError: string | null;
}

interface Props {
  admissionType: AdmissionType;
  category: StudentCategory;
  boardType: BoardType;
  applicationId: string;
  onOcrAutoFill: (docType: string, extracted: Record<string, unknown>) => void;
}

export function DocumentsStep({ admissionType, category, boardType, applicationId, onOcrAutoFill }: Props) {
  const [existingDocs, setExistingDocs] = useState<ExistingDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const requiredDocs = getRequiredDocuments(admissionType, category, boardType);

  async function fetchDocs() {
    try {
      const docs = await api<ExistingDoc[]>('/documents/mine');
      setExistingDocs(docs);
    } catch {
      // Ignore — fresh start
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchDocs();
  }, []);

  const uploadedCount = existingDocs.length;
  const totalRequired = requiredDocs.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
          <FileCheck className="w-4 h-4 text-brand-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-surface-900">Upload Documents</h2>
          <p className="text-sm text-surface-500">
            {uploadedCount} of {totalRequired} documents uploaded
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-medium">OCR will auto-extract data from your documents</p>
          <p className="mt-1">
            Upload marks cards, rank cards, and Aadhaar — our system will read them and auto-fill
            the relevant form fields. You can always review and correct the extracted data.
          </p>
        </div>
      </div>

      {/* Document Cards */}
      {isLoading ? (
        <div className="text-center py-8 text-surface-400">Loading documents...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {requiredDocs.map((doc) => {
            const existing = existingDocs.find(d => d.documentType === doc.type);
            return (
              <DocumentCard
                key={doc.type}
                docType={doc.type}
                label={doc.label}
                applicationId={applicationId}
                existingDoc={existing || null}
                onUploaded={fetchDocs}
                onOcrComplete={onOcrAutoFill}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
