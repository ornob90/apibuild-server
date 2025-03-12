/* eslint-disable prettier/prettier */
import { IsEnum, IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ParamDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['findOne', 'findAll', 'aggregate'])
  action: 'findOne' | 'findAll' | 'aggregate';
}

export class UpdateApiDto {
  @IsOptional()
  @IsEnum(['GET', 'POST', 'PUT', 'DELETE'])
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  path?: string;

  @IsOptional()
  @IsEnum(['find', 'insert', 'update', 'delete'])
  action?: 'find' | 'insert' | 'update' | 'delete';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParamDto)
  params?: ParamDto[];

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsEnum(['count', 'sum', 'avg'])
  aggregateType?: 'count' | 'sum' | 'avg';
}