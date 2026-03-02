import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum RegisterRole {
  CUSTOMER = 'CUSTOMER',
  DRIVER = 'DRIVER',
  STORE_OWNER = 'STORE_OWNER',
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(RegisterRole)
  role: RegisterRole;
}
