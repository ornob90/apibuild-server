/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateProjectDto {
  @IsString()
  @IsNotEmpty()
  projectName: string;
}