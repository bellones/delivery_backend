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

export class CreateStoreDto {
  @IsString()
  categoryId: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  deliveryFee?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minOrderValue?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  deliveryTimeMinutes?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  openingHours?: Record<string, { open: string; close: string }>;
}
