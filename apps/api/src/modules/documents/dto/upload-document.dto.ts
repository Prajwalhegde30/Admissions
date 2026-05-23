import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

const DOCUMENT_TYPES = [
  'marks_card_10th', 'marks_card_12th', 'kcet_rank_card', 'comedk_rank_card',
  'aadhaar', 'transfer_certificate', 'migration_certificate',
  'caste_certificate', 'income_certificate', 'medical_certificate',
];

export class UploadDocumentDto {
  @IsString()
  @IsNotEmpty()
  applicationId!: string;

  @IsEnum(DOCUMENT_TYPES)
  @IsNotEmpty()
  documentType!: string;
}
