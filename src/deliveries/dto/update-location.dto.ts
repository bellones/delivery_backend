import { IsNumber, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateLocationDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude: number;
}
