import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @MinLength(6, { message: 'Senha atual inválida' })
  currentPassword: string;

  @IsString()
  @MinLength(6, { message: 'Nova senha deve ter no mínimo 6 caracteres' })
  newPassword: string;
}
