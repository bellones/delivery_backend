import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DeliveryStatus } from '@prisma/client';

export class UpdateDeliveryStatusDto {
  @ApiProperty({ enum: DeliveryStatus, example: 'PICKED_UP' })
  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;
}
