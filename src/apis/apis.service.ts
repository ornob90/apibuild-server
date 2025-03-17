/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-base-to-string */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Api, ApiDocument } from 'src/schemas/api.schema';
import { Table, TableDocument } from 'src/schemas/table.schema';
import { CreateApiDto } from './dto/create-api.dto';
import { UpdateApiDto } from './dto/update-api.dto';
import { validActions, validAggregtes, validParams } from 'src/data/apis.data';

@Injectable()
export class ApisService {
  constructor(
    @InjectModel(Api.name) private apiModel: Model<ApiDocument>,
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
  ) {}

  async createApi(
    userId: string,
    createApiDto: CreateApiDto,
  ): Promise<{ apiId: string }> {
    const {
      method,
      path,
      tableId,
      action,
      params,
      sortOrder,
      limit,
      aggregateType,
    } = createApiDto;

    const table = await this.tableModel.findById(tableId).exec();
    if (!table) {
      throw new NotFoundException('Table not found');
    }

    const existingApi = await this.apiModel
      .findOne({ userId, method, path })
      .exec();
    if (existingApi) {
      throw new BadRequestException(
        `API with method '${method}' and path '${path}' already exists for this user`,
      );
    }

    if (validActions.includes(action)) {
      if (!params || params.length === 0) {
        throw new BadRequestException(
          `'Dynamic Params Is Required for Action: '${action}'`,
        );
      }
      params.forEach((param) => {
        if (
          validParams.includes(param.action) &&
          !path.includes(`:${param.name}`)
        ) {
          throw new BadRequestException(
            `Path must include the parameter ':${param.name}' for param action '${param.action}'`,
          );
        }
      });
    }

    if (action === 'find' && params.some((p) => p.action === 'aggregate')) {
      if (aggregateType && !validAggregtes.includes(aggregateType)) {
        throw new BadRequestException(
          `Invalid aggregateType: '${aggregateType}'. Must be 'count', 'sum', or 'avg'`,
        );
      }
    }

    const api = new this.apiModel({
      userId,
      method,
      path,
      tableId,
      action,
      params,
      sortOrder: sortOrder || 'asc',
      limit: limit || 10,
      aggregateType: aggregateType || 'count',
    });
    await api.save();

    return { apiId: api._id.toString() };
  }

  async getUserApis(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    apis: {
      _id: string;
      method: string;
      path: string;
      table: any;
      action: string;
      params: { name: string; action: string }[];
      sortOrder: string;
      limit: number;
      aggregateType: string;
    }[];
    total: number;
    page: number;
    limit: number;
    totalPage: number;
  }> {
    const skip = (page - 1) * limit;

    const [apis, total] = await Promise.all([
      this.apiModel
        .find({ userId })
        .skip(skip)
        .limit(limit)
        .populate('tableId')
        .exec(),
      this.apiModel.countDocuments({ userId }).exec(),
    ]);

    return {
      apis: apis.map((api) => ({
        _id: api._id.toString(),
        method: api.method,
        path: api.path,
        table: api.tableId as any,
        action: api.action,
        params: api.params,
        sortOrder: api.sortOrder,
        limit: api.limit,
        aggregateType: api.aggregateType,
      })),
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    };
  }

  async getApiById(
    userId: string,
    apiId: string,
  ): Promise<{
    apiId: string;
    method: string;
    path: string;
    tableId: string;
    action: string;
    params: { name: string; action: string }[];
    sortOrder: string;
    limit: number;
    aggregateType: string;
  }> {
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
      params: api.params,
      sortOrder: api.sortOrder,
      limit: api.limit,
      aggregateType: api.aggregateType,
    };
  }

  async updateApi(
    userId: string,
    apiId: string,
    updateApiDto: UpdateApiDto,
  ): Promise<{ apiId: string }> {
    const { method, path, action, params, sortOrder, limit, aggregateType } =
      updateApiDto;

    const api = await this.apiModel.findOne({ _id: apiId, userId }).exec();
    if (!api) {
      throw new NotFoundException('API not found');
    }

    if (method && path) {
      const duplicate = await this.apiModel.findOne({
        userId,
        method,
        path,
        _id: { $ne: apiId },
      });
      if (duplicate) {
        throw new BadRequestException(
          `API with method '${method}' and path '${path}' already exists for this user`,
        );
      }
    }

    if (action && ['find', 'update', 'delete'].includes(action)) {
      if (!params || params.length === 0) {
        throw new BadRequestException(
          `'params' array is required and must not be empty for action '${action}'`,
        );
      }
      params.forEach((param) => {
        if (
          ['findOne', 'findAll', 'aggregate'].includes(param.action) &&
          !(path || api.path).includes(`:${param.name}`)
        ) {
          throw new BadRequestException(
            `Path must include the parameter ':${param.name}' for param action '${param.action}'`,
          );
        }
      });
    }

    if (
      (action === 'find' || api.action === 'find') &&
      (params || api.params).some((p) => p.action === 'aggregate')
    ) {
      if (aggregateType && !['count', 'sum', 'avg'].includes(aggregateType)) {
        throw new BadRequestException(
          `Invalid aggregateType: '${aggregateType}'. Must be 'count', 'sum', or 'avg'`,
        );
      }
    }

    if (method) api.method = method;
    if (path) api.path = path;
    if (action) api.action = action;
    if (params) api.params = params;
    if (sortOrder) api.sortOrder = sortOrder;
    if (limit !== undefined) api.limit = limit;
    if (aggregateType) api.aggregateType = aggregateType;

    await api.save();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return { apiId: api._id.toString() };
  }

  async deleteApi(userId: string, apiId: string): Promise<void> {
    const result = await this.apiModel.deleteOne({ _id: apiId, userId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('API not found');
    }
  }
}
