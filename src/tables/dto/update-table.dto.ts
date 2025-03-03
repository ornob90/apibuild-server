/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateTableDto {
  @IsString()
  @IsNotEmpty()
  tableName: string;
}