/* eslint-disable prettier/prettier */
import { IsNotEmpty } from 'class-validator';

export class CreateUserResetPasswordDto {
  @IsNotEmpty()
  readonly token: string;

  @IsNotEmpty()
  readonly newPassword: string;
}
