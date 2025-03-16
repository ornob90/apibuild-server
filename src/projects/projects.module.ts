/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from 'src/schemas/project.schema';
import { Table, TableSchema } from 'src/schemas/table.schema';
import { Column, ColumnSchema } from 'src/schemas/column.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    MongooseModule.forFeature([{ name: Table.name, schema: TableSchema }]),
    MongooseModule.forFeature([{ name: Column.name, schema: ColumnSchema }]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
