import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Api, ApiDocument } from 'src/schemas/api.schema';
import { Table, TableDocument } from 'src/schemas/table.schema';
import { CreateApiDto } from './dto/create-api.dto';
import { UpdateApiDto } from './dto/update-api.dto';

@Injectable()
export class ApisService {
  constructor(
    @InjectModel(Api.name) private apiModel: Model<ApiDocument>,
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
  ) {}

  async createApi(userId: string, createApiDto: CreateApiDto): Promise<{ apiId: string }> {
    const { method, path, tableId, action, queryField, paramName } = createApiDto;

    // Validate table exists
    const table = await this.tableModel.findById(tableId).exec();
    if (!table) {
      throw new NotFoundException('Table not found');
    }

    // Check for duplicate method and path for this user
    const existingApi = await this.apiModel.findOne({ userId, method, path }).exec();
    if (existingApi) {
      throw new BadRequestException(`API with method '${method}' and path '${path}' already exists for this user`);
    }

    // Validate queryField and paramName for actions requiring them
    if (['findOne', 'update', 'delete'].includes(action)) {
      if (!queryField || !paramName) {
        throw new BadRequestException(`'queryField' and 'paramName' are required for action '${action}'`);
      }
      if (!path.includes(`:${paramName}`)) {
        throw new BadRequestException(`Path must include the parameter ':${paramName}' for action '${action}'`);
      }
    }

    // Create the API document
    const api = new this.apiModel({
      userId,
      method,
      path,
      tableId,
      action,
      queryField,
      paramName,
    });
    await api.save();

    return { apiId: api._id.toString() };
  }

  async getUserApis(userId: string): Promise<{ apiId: string; method: string; path: string; tableId: string; action: string }[]> {
    const apis = await this.apiModel.find({ userId }).exec();
    return apis.map(api => ({
      apiId: api._id.toString(),
      method: api.method,
      path: api.path,
      tableId: api.tableId.toString(),
      action: api.action,
    }));
  }

  async getApiById(userId: string, apiId: string): Promise<{ apiId: string; method: string; path: string; tableId: string; action: string; queryField?: string; paramName?: string }> {
    const api = await this.apiModel.findOne({ _id: apiId, userId }).exec();
    if (!api) {
      throw new NotFoundException('API not found');
    }
    return {
      apiId: api._id.toString(),
      method: api.method,
      path: api.path,
      tableId: api.tableId.toString(),
      action: api.action,
      queryField: api.queryField,
      paramName: api.paramName,
    };
  }

  async updateApi(userId: string, apiId: string, updateApiDto: UpdateApiDto): Promise<{ apiId: string }> {
    const { method, path, action, queryField, paramName } = updateApiDto;

    const api = await this.apiModel.findOne({ _id: apiId, userId }).exec();
    if (!api) {
      throw new NotFoundException('API not found');
    }

    // Check for duplicate method and path (excluding this API)
    const duplicate = await this.apiModel.findOne({
      userId,
      method,
      path,
      _id: { $ne: apiId },
    });
    if (duplicate) {
      throw new BadRequestException(`API with method '${method}' and path '${path}' already exists for this user`);
    }

    // Validate queryField and paramName for actions requiring them
    if (['findOne', 'update', 'delete'].includes(action)) {
      if (!queryField || !paramName) {
        throw new BadRequestException(`'queryField' and 'paramName' are required for action '${action}'`);
      }
      if (!path.includes(`:${paramName}`)) {
        throw new BadRequestException(`Path must include the parameter ':${paramName}' for action '${action}'`);
      }
    }

    api.method = method;
    api.path = path;
    api.action = action;
    api.queryField = String(queryField);
    api.paramName = String(paramName);
    await api.save();

    return { apiId: api._id.toString() };
  }

  async deleteApi(userId: string, apiId: string): Promise<void> {
    const result = await this.apiModel.deleteOne({ _id: apiId, userId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('API not found');
    }
  }
}