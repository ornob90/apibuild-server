/* eslint-disable prettier/prettier */
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserLoginDto {
  @IsNotEmpty({ message: 'No Email Provided' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'No Password Provided' })
  @IsString({ message: 'Password needs to be a string' })
  password: string;
}