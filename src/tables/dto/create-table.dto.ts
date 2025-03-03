/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty, IsArray, IsBoolean } from 'class-validator';

export class ColumnDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsBoolean()
  required: boolean;

  @IsBoolean()
  unique: boolean;
}

export class CreateTableDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  tableName: string;

  @IsArray()
  @IsNotEmpty()
  columns: ColumnDto[];
}