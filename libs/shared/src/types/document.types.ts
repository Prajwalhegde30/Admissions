import { DocumentType, DocumentStatus } from '../constants/enums';

export interface DocumentResponse {
  id: string;
  documentType: DocumentType;
  status: DocumentStatus;
  ocrStatus: string;
  fileName: string | null;
  fileSize: number | null;
  uploadedAt: string | null;
}
