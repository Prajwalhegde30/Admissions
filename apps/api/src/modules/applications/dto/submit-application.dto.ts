import { IsEnum, IsNotEmpty } from 'class-validator';

export class SubmitApplicationDto {
  @IsEnum(['kcet', 'comedk', 'management'])
  @IsNotEmpty()
  admissionType!: string;

  @IsEnum(['general', 'sc', 'st', 'obc', 'ph'])
  @IsNotEmpty()
  category!: string;
}
