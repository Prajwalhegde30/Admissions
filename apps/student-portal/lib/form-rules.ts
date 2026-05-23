/**
 * Adaptive form rules based on PRD §5.2.
 * Determines which fields/documents are visible based on admission type, category, and board.
 */

export type AdmissionType = 'kcet' | 'comedk' | 'management';
export type StudentCategory = 'general' | 'sc' | 'st' | 'obc' | 'ph';
export type BoardType = 'karnataka_state' | 'cbse' | 'icse' | 'other';

export interface FormVisibility {
  showKcetFields: boolean;
  showComedkFields: boolean;
  showEntranceExamStep: boolean;
  requireCasteCertificate: boolean;
  requireIncomeCertificate: boolean;
  requireMigrationCertificate: boolean;
  requireMedicalCertificate: boolean;
  requireKcetRankCard: boolean;
  requireComedkRankCard: boolean;
}

export function getFormVisibility(
  admissionType?: AdmissionType,
  category?: StudentCategory,
  boardType?: BoardType,
): FormVisibility {
  return {
    showKcetFields: admissionType === 'kcet',
    showComedkFields: admissionType === 'comedk',
    showEntranceExamStep: admissionType !== 'management',
    requireKcetRankCard: admissionType === 'kcet',
    requireComedkRankCard: admissionType === 'comedk',
    requireCasteCertificate: category === 'sc' || category === 'st' || category === 'obc',
    requireIncomeCertificate: category === 'sc' || category === 'st' || category === 'obc',
    requireMedicalCertificate: category === 'ph',
    requireMigrationCertificate: boardType !== undefined && boardType !== 'karnataka_state',
  };
}

export function getRequiredDocuments(
  admissionType?: AdmissionType,
  category?: StudentCategory,
  boardType?: BoardType,
): { type: string; label: string; required: boolean }[] {
  const v = getFormVisibility(admissionType, category, boardType);

  return [
    { type: 'marks_card_10th', label: '10th Marks Card', required: true },
    { type: 'marks_card_12th', label: '12th Marks Card', required: true },
    { type: 'kcet_rank_card', label: 'KCET Rank Card', required: v.requireKcetRankCard },
    { type: 'comedk_rank_card', label: 'COMEDK Rank Card', required: v.requireComedkRankCard },
    { type: 'aadhaar', label: 'Aadhaar Card', required: true },
    { type: 'transfer_certificate', label: 'Transfer Certificate', required: true },
    { type: 'migration_certificate', label: 'Migration Certificate', required: v.requireMigrationCertificate },
    { type: 'caste_certificate', label: 'Caste Certificate', required: v.requireCasteCertificate },
    { type: 'income_certificate', label: 'Income Certificate', required: v.requireIncomeCertificate },
    { type: 'medical_certificate', label: 'Medical Certificate', required: v.requireMedicalCertificate },
  ].filter(d => d.required);
}
