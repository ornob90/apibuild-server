/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-case-declarations */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Api, ApiDocument } from 'src/schemas/api.schema';
import { Table, TableDocument } from 'src/schemas/table.schema';
import { match } from 'path-to-regexp';

@Injectable()
export class ApiBuildService {
  constructor(
    @InjectModel(Api.name) private apiModel: Model<ApiDocument>,
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
    @InjectConnection() private connection: Connection,
  ) {}

  async executeApi(
    userId: string,
    method: string,
    path: string,
    body?: any,
  ): Promise<any> {
    // Find matching API definition
    const apis = await this.apiModel.find({ userId, method }).exec();
    let matchedApi: ApiDocument | null = null;
    let params: Record<string, string> = {};

    for (const api of apis) {
      const matcher = match(api.path, { decode: decodeURIComponent });
      const result = matcher(path);
      if (result) {
        matchedApi = api;
        params = result.params as Record<string, string>;
        break;
      }
    }

    if (!matchedApi) {
      throw new NotFoundException(`No API found for ${method} ${path}`);
    }

    // Get the associated table
    const table = await this.tableModel.findById(matchedApi.tableId).exec();
    if (!table) {
      throw new NotFoundException('Associated table not found');
    }

    // Construct collection name
    const collectionName = `${userId}_${String(table.projectId)}_${table.tableName}`;

    if (!this.connection.db) {
      throw new Error('Database connection not established');
    }
    const collection = this.connection.db.collection(collectionName);

    // Execute the API action
    switch (matchedApi.action) {
      case 'findOne':
        if (!params[matchedApi.paramName]) {
          throw new BadRequestException(
            `Missing parameter: ${matchedApi.paramName}`,
          );
        }
        return await collection.findOne({
          [matchedApi.queryField]: params[matchedApi.paramName],
        });

      case 'findAll':
        return await collection.find({}).toArray();

      case 'insert':
        if (!body || Object.keys(body).length === 0) {
          throw new BadRequestException('Request body is empty');
        }
        const insertResult = await collection.insertOne(body);

        return { insertedId: insertResult.insertedId };

      case 'update':
        if (!params[matchedApi.paramName]) {
          throw new BadRequestException(
            `Missing parameter: ${matchedApi.paramName}`,
          );
        }
        if (!body || Object.keys(body).length === 0) {
          throw new BadRequestException('Request body is empty');
        }

        const updateResult = await collection.updateOne(
          { [matchedApi.queryField]: params[matchedApi.paramName] },
          { $set: body },
        );
        return { modifiedCount: updateResult.modifiedCount };

      case 'delete':
        if (!params[matchedApi.paramName]) {
          throw new BadRequestException(
            `Missing parameter: ${matchedApi.paramName}`,
          );
        }
        const deleteResult = await collection.deleteOne({
          [matchedApi.queryField]: params[matchedApi.paramName],
        });
        return { deletedCount: deleteResult.deletedCount };

      case 'aggregate':
        throw new BadRequestException('Aggregate action not yet supported');

      default:
        throw new BadRequestException(
          `Unsupported action: ${matchedApi.action}`,
        );
    }
  }
}
