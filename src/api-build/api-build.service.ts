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

import { AnalyticsService } from 'src/analytics/analytics.service';

@Injectable()
export class ApiBuildService {
  constructor(
    @InjectModel(Api.name) private apiModel: Model<ApiDocument>,
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
    @InjectConnection() private connection: Connection,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async executeApi(userId: string, method: string, path: string, body?: any): Promise<any> {
    await this.analyticsService.incrementAnalytics(userId, 'apiCalls');
  
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
      await this.analyticsService.incrementAnalytics(userId, 'failedApiCalls');
      throw new NotFoundException(`No API found for ${method} ${path}`);
    }
  
    const table = await this.tableModel.findById(matchedApi.tableId).exec();
    if (!table) {
      await this.analyticsService.incrementAnalytics(userId, 'failedApiCalls');
      throw new NotFoundException('Associated table not found');
    }
  
    const collectionName = `${userId}_${String(table.projectId)}_${table.tableName}`;
    if (!this.connection.db) {
      await this.analyticsService.incrementAnalytics(userId, 'failedApiCalls');
      throw new Error('Database connection not established');
    }
  
    const collection = this.connection.db.collection(collectionName);
  
    const filter = {};
    
    if (matchedApi.params.length > 0) {
      matchedApi.params.forEach(param => {
        if (params[param.name]) {
          if (param.action === 'findOne') {
            filter[param.name] = params[param.name];
          }
        }
      });
    }
  
    switch (matchedApi.action) {
      case 'find':
        if (matchedApi.params.length === 0) {
          await this.analyticsService.incrementAnalytics(userId, 'failedApiCalls');
          throw new BadRequestException('No parameters provided for find');
        }
  
        const response: { findOne?: any; findAll?: any; aggregate?: any } = {};
        const findOneParams = matchedApi.params.filter(p => p.action === 'findOne');
        const findAllParams = matchedApi.params.find(p => p.action === 'findAll');
        const aggregateParams = matchedApi.params.find(p => p.action === 'aggregate');
  
        if (findOneParams.length > 0) {
          if (Object.keys(filter).length === 0) {
            await this.analyticsService.incrementAnalytics(userId, 'failedApiCalls');
            throw new BadRequestException('No valid findOne parameters provided');
          }
          response.findOne = await collection.findOne(filter);
        }
  
        if (findAllParams) {
          response.findAll = await collection
            .find({})
            .sort({ _id: matchedApi.sortOrder === 'asc' ? 1 : -1 })
            .limit(matchedApi.limit)
            .toArray();
        }
  
        if (aggregateParams) {
          let aggregateResult;
          switch (matchedApi.aggregateType) {
            case 'count':
              aggregateResult = await collection
                .aggregate([{ $match: filter }, { $group: { _id: null, count: { $sum: 1 } } }])
                .toArray();
              break;
  
            case 'sum':
              aggregateResult = await collection
                .aggregate([{ $match: filter }, { $group: { _id: null, sum: { $sum: "$value" } } }])
                .toArray();
              break;
  
            case 'avg':
              aggregateResult = await collection
                .aggregate([{ $match: filter }, { $group: { _id: null, avg: { $avg: "$value" } } }])
                .toArray();
              break;
          }
          response.aggregate = aggregateResult;
        }
  
        return response;
  
      case 'insert':
        if (!body || Object.keys(body).length === 0) {
          await this.analyticsService.incrementAnalytics(userId, 'failedApiCalls');
          throw new BadRequestException('Request body is empty');
        }
        const insertResult = await collection.insertOne(body);
        return matchedApi.returnIdOnly
          ? { insertedId: insertResult.insertedId }
          : { insertedId: insertResult.insertedId, document: body };
  
      case 'update':
        if (Object.keys(filter).length === 0) {
          await this.analyticsService.incrementAnalytics(userId, 'failedApiCalls');
          throw new BadRequestException('No parameters provided for update');
        }
        if (!body || Object.keys(body).length === 0) {
          await this.analyticsService.incrementAnalytics(userId, 'failedApiCalls');
          throw new BadRequestException('Request body is empty');
        }
        const updateResult = await collection.updateOne(filter, { $set: body });
        return matchedApi.returnUpdated
          ? { modifiedCount: updateResult.modifiedCount, updated: body }
          : { modifiedCount: updateResult.modifiedCount };
  
      case 'delete':
        if (Object.keys(filter).length === 0) {
          await this.analyticsService.incrementAnalytics(userId, 'failedApiCalls');
          throw new BadRequestException('No parameters provided for delete');
        }
        const deleteResult = await collection.deleteOne(filter);
        return matchedApi.returnCount
          ? { deletedCount: deleteResult.deletedCount }
          : { success: deleteResult.deletedCount > 0 };
  
      default:
        await this.analyticsService.incrementAnalytics(userId, 'failedApiCalls');
        throw new BadRequestException(`Unsupported action: ${matchedApi.action}`);
    }
  }
}
