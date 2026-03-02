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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiPropertyOptional({ example: 'Casa', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;

  @ApiProperty({ example: 'Rua das Flores', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  street: string;

  @ApiProperty({ example: '100', maxLength: 20 })
  @IsString()
  @MaxLength(20)
  number: string;

  @ApiPropertyOptional({ example: 'Apto 42', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  complement?: string;

  @ApiProperty({ example: 'Centro', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  neighborhood: string;

  @ApiProperty({ example: 'São Paulo', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'SP', maxLength: 2 })
  @IsString()
  @MaxLength(2)
  state: string;

  @ApiProperty({ example: '01234-567', maxLength: 10 })
  @IsString()
  @MaxLength(10)
  zipCode: string;

  @ApiPropertyOptional({ example: -23.5505, minimum: -90, maximum: 90 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: -46.6333, minimum: -180, maximum: 180 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isDefault?: boolean;
}
