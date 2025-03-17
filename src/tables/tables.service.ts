/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-base-to-string */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Table, TableDocument } from 'src/schemas/table.schema';
import { Column, ColumnDocument } from 'src/schemas/column.schema';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { jsonSchema } from 'src/types/mongodb.types';

@Injectable()
export class TablesService {
  constructor(
    @InjectModel(Table.name) private tableModel: Model<TableDocument>,
    @InjectModel(Column.name) private columnModel: Model<ColumnDocument>,
    @InjectConnection() private connection: Connection,
  ) {}

  async createTable(
    userId: string,
    createTableDto: CreateTableDto,
  ): Promise<{ tableId: string }> {
    try {
      const { projectId, tableName, columns } = createTableDto;

      // Ensure db is defined
      if (!this.connection.db) {
        throw new Error('Database connection not established');
      }

      // Construct the full table name with userId
      const fullTableName = `${userId}_${projectId}_${tableName}`;

      // Check if table name already exists in the project
      const existingTable = await this.tableModel
        .findOne({ projectId, tableName })
        .exec();
      if (existingTable) {
        throw new BadRequestException(
          `Table '${tableName}' already exists in this project for this user`,
        );
      }

      // Create the table document (store original tableName, not full name)
      const table = new this.tableModel({ userId, projectId, tableName });
      await table.save();

      // Create column documents
      const columnDocs = columns.map((col) => ({
        tableId: table._id,
        name: col.name,
        type: col.type,
        required: col.required,
        unique: col.unique,
      }));

      await this.columnModel.insertMany(columnDocs);

      // Construct MongoDB collection name
      const collectionName = fullTableName;

      console.log(collectionName);

      // Generate JSON Schema for validation
      const requiredFields = columns
        .filter((c) => c.required)
        .map((c) => c.name);

      const schema: jsonSchema = {
        bsonType: 'object',
        properties: columns.reduce((acc, col) => {
          acc[col.name] = { bsonType: col.type.toLowerCase() };
          return acc;
        }, {}),
      };

      if (requiredFields.length > 0) {
        schema.required = requiredFields;
      }

      // Create the collection with schema validation
      await this.connection.db.createCollection(collectionName, {
        validator: { $jsonSchema: schema },
      });

      // Add unique indexes
      const uniqueColumns = columns.filter((c) => c.unique);

      for (const col of uniqueColumns) {
        await this.connection.db
          .collection(collectionName)
          .createIndex({ [col.name]: 1 }, { unique: true });
      }

      return { tableId: table._id.toString() };
    } catch (error: any) {
      // console.log(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getTablesByProject(
    userId: string,
    projectId: string,
  ): Promise<{ tableId: string; tableName: string }[]> {
    const tables = await this.tableModel.find({ projectId }).exec();
    return tables.map((table) => ({
      tableId: table._id.toString(),
      tableName: table.tableName,
    }));
  }

  async getTablesByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    tables: { _id: string; projectId: string; tableName: string }[];
    total: number;
    page: number;
    limit: number;
    totalPage: number;
  }> {
    const skip = (page - 1) * limit;

    const [tables, total] = await Promise.all([
      this.tableModel.find({ userId }).skip(skip).limit(limit).exec(),
      this.tableModel.countDocuments({ userId }).exec(),
    ]);

    return {
      tables: tables.map((table) => ({
        _id: table._id.toString(),
        projectId: table.projectId.toString(),
        tableName: table.tableName,
      })),
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    };
  }

  async getTablesWithColumns(
    userId: string,
  ): Promise<{ tableId: string; tableName: string; columnNames: string[] }[]> {
    const tables = await this.tableModel.find({ userId }).exec();
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

    return tables.map((table) => ({
      tableId: table._id.toString(),
      tableName: table.tableName,
      columnNames: columnMap[table?._id.toString()] || [],
    }));
  }

  async getTableById(
    userId: string,
    tableId: string,
  ): Promise<{
    tableId: string;
    projectId: string;
    tableName: string;
    columns: any[];
  }> {
    const table = await this.tableModel.findById(tableId).exec();

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    const columns = await this.columnModel.find({ tableId: table._id }).exec();
    return {
      tableId: table._id.toString(),
      projectId: table.projectId.toString(),
      tableName: table.tableName,
      columns: columns.map((col) => ({
        name: col.name,
        type: col.type,
        required: col.required,
        unique: col.unique,
      })),
    };
  }

  async updateTable(
    userId: string,
    tableId: string,
    updateTableDto: UpdateTableDto,
  ): Promise<{ tableId: string }> {
    const { tableName } = updateTableDto;

    const table = await this.tableModel.findById(tableId).exec();
    if (!table) {
      throw new NotFoundException('Table not found');
    }

    // Check for duplicate table name in the project
    const duplicate = await this.tableModel.findOne({
      projectId: table.projectId,
      tableName,
      _id: { $ne: tableId },
    });
    if (duplicate) {
      throw new BadRequestException(
        `Table '${tableName}' already exists in this project for this user`,
      );
    }

    // Ensure db is defined
    if (!this.connection.db) {
      throw new Error('Database connection not established');
    }

    // Rename the collection in MongoDB
    const oldCollectionName = `${userId}_${String(table.projectId)}_${table.tableName}`;
    const newCollectionName = `${userId}_${String(table.projectId)}_${tableName}`;
    await this.connection.db
      .collection(oldCollectionName)
      .rename(newCollectionName);

    // Update table document with new tableName
    table.tableName = tableName;
    await table.save();

    return { tableId: table._id.toString() };
  }

  async deleteTable(userId: string, tableId: string): Promise<void> {
    if (!this.connection.db) {
      throw new Error('Database connection not established');
    }

    const table = await this.tableModel.findById(tableId).exec();

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    // Delete associated columns
    await this.columnModel.deleteMany({ tableId: table._id }).exec();

    // Drop the MongoDB collection
    const collectionName = `${userId}_${String(table.projectId)}_${String(table.tableName)}`;

    await this.connection.db.collection(collectionName).drop();

    // Delete the table document
    await this.tableModel.deleteOne({ _id: tableId }).exec();
  }
}
