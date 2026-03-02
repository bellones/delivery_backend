import {
  IsArray,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({ example: 'clxxx...', description: 'ID do produto' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @ApiPropertyOptional({ example: 'Sem cebola' })
  @IsOptional()
  @IsString()
  observations?: string;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'clxxx...', description: 'ID da loja' })
  @IsString()
  storeId: string;

  @ApiProperty({ example: 'clxxx...', description: 'ID do endereço de entrega' })
  @IsString()
  addressId: string;

  @ApiProperty({ example: 'CREDIT_CARD', description: 'CREDIT_CARD, PIX, etc.' })
  @IsString()
  paymentMethod: string;

  @ApiPropertyOptional({ example: 'Entregar no portão' })
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
