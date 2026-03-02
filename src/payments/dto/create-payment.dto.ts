import { IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsOptional()
  @IsString()
  externalId?: string;
}
