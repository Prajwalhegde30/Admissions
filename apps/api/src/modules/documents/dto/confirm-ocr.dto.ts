import { IsObject, IsNotEmpty } from 'class-validator';

export class ConfirmOcrDto {
  @IsObject()
  @IsNotEmpty()
  confirmedData!: Record<string, unknown>;
}
