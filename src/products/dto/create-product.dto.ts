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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiPropertyOptional({ description: 'ID da categoria do produto no cardápio' })
  @IsOptional()
  @IsString()
  productCategoryId?: string;

  @ApiProperty({ example: 'Pizza Margherita', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Molho, mussarela e manjericão' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 45.9, minimum: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({ example: 'https://exemplo.com/foto.png' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sortOrder?: number;
}
