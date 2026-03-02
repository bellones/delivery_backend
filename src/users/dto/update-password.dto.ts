import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({ example: '123456', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Senha atual inválida' })
  currentPassword: string;

  @ApiProperty({ example: 'novaSenha123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Nova senha deve ter no mínimo 6 caracteres' })
  newPassword: string;
}
