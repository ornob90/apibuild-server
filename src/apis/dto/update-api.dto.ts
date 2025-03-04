/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class UpdateApiDto {
  @IsString()
  @IsNotEmpty()
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';

  @IsString()
  @IsNotEmpty()
  path: string;

  @IsEnum(['findOne', 'findAll', 'aggregate', 'insert', 'update', 'delete'])
  @IsNotEmpty()
  action: 'findOne' | 'findAll' | 'aggregate' | 'insert' | 'update' | 'delete';

  @IsString()
  queryField?: string;

  @IsString()
  paramName?: string;
}