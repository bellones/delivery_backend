import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsString()
  type: 'store' | 'driver';
}
