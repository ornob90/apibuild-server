/* eslint-disable prettier/prettier */
import { IsNotEmpty } from 'class-validator';

export class CreateUserVerifyDto {
  @IsNotEmpty({ message: 'Token Missing!' })
  readonly token: string;
}
