/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateProjectDto {
  @IsString({ message: 'Project Name have to be string' })
  @IsNotEmpty({ message: 'Project name is required!' })
  projectName: string;
}
