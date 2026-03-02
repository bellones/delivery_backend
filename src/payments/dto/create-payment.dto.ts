import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiPropertyOptional({ description: 'ID externo do gateway de pagamento' })
  @IsOptional()
  @IsString()
  externalId?: string;
}
