/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MongoDBID } from 'src/types/schema.types';

@Schema()
export class Table extends Document {
  // _id automatically provided by Mongoose as ObjectId

  @Prop({ required: true, type: Types.ObjectId, ref: 'Project' })
  projectId: Types.ObjectId;

  @Prop({ required: true })
  tableName: string;
}


export type TableDocument = Table & Document & MongoDBID;
export const TableSchema = SchemaFactory.createForClass(Table);


// Ensure tableName is unique within a project
TableSchema.index({ projectId: 1, tableName: 1 }, { unique: true });