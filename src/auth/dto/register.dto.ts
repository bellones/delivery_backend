import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RegisterRole {
  CUSTOMER = 'CUSTOMER',
  DRIVER = 'DRIVER',
  STORE_OWNER = 'STORE_OWNER',
}

export class RegisterDto {
  @ApiProperty({ example: 'usuario@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '11999990000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: RegisterRole, example: RegisterRole.CUSTOMER })
  @IsEnum(RegisterRole)
  role: RegisterRole;
}
