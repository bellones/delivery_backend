import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating: number;

  @ApiPropertyOptional({ example: 'Muito bom!' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ enum: ['store', 'driver'], example: 'store' })
  @IsString()
  type: 'store' | 'driver';
}
