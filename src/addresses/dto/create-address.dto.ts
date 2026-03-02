import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAddressDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;

  @IsString()
  @MaxLength(200)
  street: string;

  @IsString()
  @MaxLength(20)
  number: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  complement?: string;

  @IsString()
  @MaxLength(100)
  neighborhood: string;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsString()
  @MaxLength(2)
  state: string;

  @IsString()
  @MaxLength(10)
  zipCode: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isDefault?: boolean;
}
