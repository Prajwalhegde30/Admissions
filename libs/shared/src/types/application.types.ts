import { ApplicationStatus, AdmissionType, StudentCategory } from '../constants/enums';

export interface ApplicationResponse {
  id: string;
  studentId: string;
  admissionType: AdmissionType;
  category: StudentCategory;
  status: ApplicationStatus;
  formData: Record<string, unknown>;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
