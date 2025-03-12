/* eslint-disable prettier/prettier */

/* eslint-disable prettier/prettier */

import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserForgotPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
