import {
  IsOptional,
  IsString,
  IsUrl,
  IsNumber,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsOptional()
  @IsString()
  productCategoryId?: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sortOrder?: number;
}
