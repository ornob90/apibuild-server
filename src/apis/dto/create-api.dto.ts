/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateApiDto {
  @IsString()
  @IsNotEmpty()
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';

  @IsString()
  @IsNotEmpty()
  path: string;

  @IsString()
  @IsNotEmpty()
  tableId: string;

  @IsEnum(['findOne', 'findAll', 'aggregate', 'insert', 'update', 'delete'])
  @IsNotEmpty()
  action: 'findOne' | 'findAll' | 'aggregate' | 'insert' | 'update' | 'delete';

  @IsString()
  queryField?: string; // Optional, for findOne, update, delete

  @IsString()
  paramName?: string; // Optional, for findOne, update, delete
}