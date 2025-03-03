/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MongoDBID } from 'src/types/schema.types';


@Schema()
export class Api extends Document {
  // _id automatically provided by Mongoose as ObjectId

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['GET', 'POST', 'PUT', 'DELETE'] })
  method: string;

  @Prop({ required: true })
  path: string; // e.g., "/users/:id"

  @Prop({ required: true, type: Types.ObjectId, ref: 'Table' })
  tableId: Types.ObjectId;

  @Prop({ required: true, enum: ['findOne', 'findAll', 'aggregate', 'insert', 'update', 'delete'] })
  action: string;

  @Prop()
  queryField: string; // Optional, for findOne, update, delete

  @Prop()
  paramName: string; // Optional, for findOne, update, delete

  @Prop()
  sortField: string; // Optional, for findAll

  @Prop({ enum: [1, -1] })
  sortOrder: number; // Optional, for findAll

  @Prop()
  limit: number; // Optional, for findAll

  @Prop()
  groupBy: string; // Optional, for aggregate

  @Prop({ enum: ['count', 'sum', 'average'] })
  aggregateType: string; // Optional, for aggregate

  @Prop()
  aggregateField: string; // Optional, for aggregate

  @Prop({ default: false })
  returnIdOnly: boolean; // Optional, for insert

  @Prop({ default: false })
  returnUpdated: boolean; // Optional, for update

  @Prop({ default: false })
  returnCount: boolean; // Optional, for delete
}

export type ApiDocument = Api & Document & MongoDBID;
export const ApiSchema = SchemaFactory.createForClass(Api);

// Index for faster lookup by userId and path
ApiSchema.index({ userId: 1, path: 1 });