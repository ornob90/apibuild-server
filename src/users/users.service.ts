/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-base-to-string */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from 'src/schemas/project.schema';
import { Table, TableDocument } from 'src/schemas/table.schema';
import { Api, ApiDocument } from 'src/schemas/api.schema';
import { Column, ColumnDocument } from 'src/schemas/column.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
    @InjectModel(Api.name) private apiModel: Model<ApiDocument>,
    @InjectModel(Column.name) private columnModel: Model<ColumnDocument>,
  ) {}

  async getUserData(userId: string): Promise<{
    projects: { _id: string; projectName: string }[];
    tables: { _id: string; projectId: string; tableName: string }[];
    apis: {
      _id: string;
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

    const tableIds = tables.map((table) => table._id);
    const columns = await this.columnModel
      .find({ tableId: { $in: tableIds } })
      .exec();

    const columnMap = columns.reduce((acc, col) => {
      const tableIdStr = col.tableId.toString();

      if (!acc[tableIdStr]) {
        acc[tableIdStr] = [];
      }

      acc[tableIdStr].push(col.name);
      return acc;
    }, {});

    return {
      projects: projects.map((project) => ({
        _id: project._id.toString(),
        projectName: project.projectName,
      })),
      tables: tables.map((table) => ({
        _id: table._id.toString(),
        projectId: table?.projectId.toString(),
        tableName: table.tableName,
        columnNames: columnMap[table?._id.toString()] || [],
      })),
      apis: apis.map((api) => ({
        _id: api._id.toString(),
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
