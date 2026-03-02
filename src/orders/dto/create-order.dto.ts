import {
  IsArray,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @IsOptional()
  @IsString()
  observations?: string;
}

export class CreateOrderDto {
  @IsString()
  storeId: string;

  @IsString()
  addressId: string;

  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
