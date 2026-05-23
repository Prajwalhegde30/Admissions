import { IsString, IsNotEmpty, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class FieldUpdate {
  @IsString()
  @IsNotEmpty()
  fieldPath!: string;

  @IsNotEmpty()
  value: unknown;
}

export class SaveDraftDto {
  /** Single field update */
  @IsOptional()
  @IsString()
  fieldPath?: string;

  @IsOptional()
  value?: unknown;

  /** Batch field update */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldUpdate)
  fields?: FieldUpdate[];
}
