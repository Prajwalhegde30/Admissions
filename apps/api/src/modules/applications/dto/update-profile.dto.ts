import { IsOptional, IsString, IsDateString, IsInt, IsNumber, IsEnum } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsDateString() dateOfBirth?: string;
  @IsOptional() @IsString() gender?: string;
  @IsOptional() @IsString() fatherName?: string;
  @IsOptional() @IsString() motherName?: string;
  @IsOptional() @IsString() guardianPhone?: string;

  @IsOptional() @IsString() addressLine1?: string;
  @IsOptional() @IsString() addressLine2?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() pincode?: string;

  @IsOptional() @IsEnum(['kcet', 'comedk', 'management']) admissionType?: string;
  @IsOptional() @IsEnum(['general', 'sc', 'st', 'obc', 'ph']) category?: string;
  @IsOptional() @IsEnum(['karnataka_state', 'cbse', 'icse', 'other']) boardType?: string;
  @IsOptional() @IsString() preferredBranch?: string;

  @IsOptional() @IsString() tenthSchool?: string;
  @IsOptional() @IsString() tenthBoard?: string;
  @IsOptional() @IsInt() tenthYear?: number;
  @IsOptional() @IsNumber() tenthPercentage?: number;
  @IsOptional() @IsString() tenthRegisterNo?: string;

  @IsOptional() @IsString() twelfthSchool?: string;
  @IsOptional() @IsString() twelfthBoard?: string;
  @IsOptional() @IsInt() twelfthYear?: number;
  @IsOptional() @IsNumber() twelfthPercentage?: number;
  @IsOptional() @IsString() twelfthRegisterNo?: string;
  @IsOptional() @IsNumber() twelfthPhysics?: number;
  @IsOptional() @IsNumber() twelfthChemistry?: number;
  @IsOptional() @IsNumber() twelfthMaths?: number;
  @IsOptional() @IsNumber() twelfthPcmPercentage?: number;

  @IsOptional() @IsString() cetNumber?: string;
  @IsOptional() @IsInt() cetRank?: number;
  @IsOptional() @IsInt() cetCategoryRank?: number;
  @IsOptional() @IsString() comedkNumber?: string;
  @IsOptional() @IsInt() comedkRank?: number;
}
