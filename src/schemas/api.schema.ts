/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { MongoDBID } from 'src/types/schema.types';


@Schema()
export class Api extends Document {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Schema.Types.ObjectId

  @Prop({ required: true, enum: ['GET', 'POST', 'PUT', 'DELETE'] })
  method: string;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Table' })
  tableId: mongoose.Schema.Types.ObjectId

  @Prop({ required: true, enum: ['find', 'insert', 'update', 'delete'] })
  action: string;

  @Prop()
  queryField: string;

  @Prop({
    type: [{ name: String, action: { type: String, enum: ['findOne', 'findAll', 'aggregate'] } }],
    default: [],
  })
  params: { name: string; action: 'findOne' | 'findAll' | 'aggregate' }[];

  @Prop({ enum: ['asc', 'desc'], default: 'asc' })
  sortOrder: string;

  @Prop({ type: Number, default: 10 })
  limit: number;

  @Prop({ enum: ['count', 'sum', 'avg'], default: 'count' })
  aggregateType: string;

  @Prop({ default: false })
  returnIdOnly: boolean;

  @Prop({ default: false })
  returnUpdated: boolean;

  @Prop({ default: false })
  returnCount: boolean;
}

export type ApiDocument = Api & Document & MongoDBID;
export const ApiSchema = SchemaFactory.createForClass(Api);

ApiSchema.index({ userId: 1, path: 1 });