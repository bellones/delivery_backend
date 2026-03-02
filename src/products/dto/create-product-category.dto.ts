import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductCategoryDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sortOrder?: number;
}
