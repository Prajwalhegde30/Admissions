import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateApplicationReviewDto {
  @IsNotEmpty()
  @IsIn(['approved', 'rejected'])
  status!: 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  notes?: string;
}
