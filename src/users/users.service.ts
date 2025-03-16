/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-base-to-string */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from 'src/schemas/project.schema';
import { Table, TableDocument } from 'src/schemas/table.schema';
import { Api, ApiDocument } from 'src/schemas/api.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
    @InjectModel(Api.name) private apiModel: Model<ApiDocument>,
  ) {}

  async getUserData(userId: string): Promise<{
    projects: { projectId: string; name: string }[];
    tables: { tableId: string; projectId: string; tableName: string }[];
    apis: {
      apiId: string;
      method: string;
      path: string;
      tableId: string;
      action: string;
      params: { name: string; action: string }[];
      sortOrder: string;
      limit: number;
      aggregateType: string;
    }[];
  }> {
    const [projects, tables, apis] = await Promise.all([
      this.projectModel.find({ userId }).exec(),
      this.tableModel.find({ userId }).exec(),
      this.apiModel.find({ userId }).exec(),
    ]);

    return {
      projects: projects.map((project) => ({
        projectId: project._id.toString(),
        name: project.projectName,
      })),
      tables: tables.map((table) => ({
        tableId: table._id.toString(),
        projectId: table?.projectId.toString(),
        tableName: table.tableName,
      })),
      apis: apis.map((api) => ({
        apiId: api._id.toString(),
        method: api.method,
        path: api.path,
        tableId: api.tableId.toString(),
        action: api.action,
        params: api.params,
        sortOrder: api.sortOrder,
        limit: api.limit,
        aggregateType: api.aggregateType,
      })),
    };
  }
}