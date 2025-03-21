/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from 'src/schemas/project.schema';
import { Table, TableSchema } from 'src/schemas/table.schema';
import { Api, ApiSchema } from 'src/schemas/api.schema';
import { Column, ColumnSchema } from 'src/schemas/column.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Table.name, schema: TableSchema },
      { name: Api.name, schema: ApiSchema },
      { name: Column.name, schema: ColumnSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
