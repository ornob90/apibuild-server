/* eslint-disable prettier/prettier */

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserRegisterDto {
  readonly id: number;

  @IsNotEmpty({ message: 'User Name is required' })
  @IsString({ message: 'User Name needs to be string' })
  readonly userName: string;

  @IsNotEmpty({ message: 'Display Name is required' })
  @IsString({ message: 'Display Name needs to be string' })
  readonly displayName: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  readonly email: string;

  @IsNotEmpty({ message: 'password is required' })
  @MinLength(6, { message: 'Password needs to be at least 6 characters long' })
  readonly password: string;
}
