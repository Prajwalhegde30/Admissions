// Enums matching Prisma schema exactly — used by both frontend and backend

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  STUDENT = 'student',
}

export enum AdmissionType {
  KCET = 'kcet',
  COMEDK = 'comedk',
  MANAGEMENT = 'management',
}

export enum StudentCategory {
  GENERAL = 'general',
  SC = 'sc',
  ST = 'st',
  OBC = 'obc',
  PH = 'ph',
}

export enum BoardType {
  KARNATAKA_STATE = 'karnataka_state',
  CBSE = 'cbse',
  ICSE = 'icse',
  OTHER = 'other',
}

export enum ApplicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CORRECTION_REQUESTED = 'correction_requested',
}

export enum DocumentType {
  MARKS_CARD_10TH = 'marks_card_10th',
  MARKS_CARD_12TH = 'marks_card_12th',
  KCET_RANK_CARD = 'kcet_rank_card',
  COMEDK_RANK_CARD = 'comedk_rank_card',
  AADHAAR = 'aadhaar',
  TRANSFER_CERTIFICATE = 'transfer_certificate',
  MIGRATION_CERTIFICATE = 'migration_certificate',
  CASTE_CERTIFICATE = 'caste_certificate',
  INCOME_CERTIFICATE = 'income_certificate',
  MEDICAL_CERTIFICATE = 'medical_certificate',
}

export enum DocumentStatus {
  PENDING = 'pending',
  UPLOADED = 'uploaded',
  UNDER_REVIEW = 'under_review',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum CorrectionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

export enum NotificationType {
  INVITE_SENT = 'invite_sent',
  APPLICATION_SUBMITTED = 'application_submitted',
  DOCUMENT_VERIFIED = 'document_verified',
  DOCUMENT_REJECTED = 'document_rejected',
  CORRECTION_REQUESTED = 'correction_requested',
  CORRECTION_APPROVED = 'correction_approved',
  CORRECTION_REJECTED = 'correction_rejected',
  APPLICATION_APPROVED = 'application_approved',
  APPLICATION_REJECTED = 'application_rejected',
}

// Constants
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const INVITE_EXPIRY_HOURS = 72;
export const S3_PRESIGN_EXPIRY_SECONDS = 600; // 10 minutes
export const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
export const AUTH_RATE_LIMIT = { ttl: 15 * 60 * 1000, limit: 5 }; // 5 attempts per 15 min
