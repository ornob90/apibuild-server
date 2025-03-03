/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MongoDBID } from 'src/types/schema.types';

@Schema()
export class Column extends Document {
  // _id automatically provided by Mongoose as ObjectId

  @Prop({ required: true, type: Types.ObjectId, ref: 'Table' })
  tableId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string; // e.g., "String", "Number", "Boolean"

  @Prop({ default: false })
  required: boolean;

  @Prop({ default: false })
  unique: boolean;
}


export type ColumnDocument = Column & Document & MongoDBID;
export const ColumnSchema = SchemaFactory.createForClass(Column);

// Index for faster lookup by tableId
ColumnSchema.index({ tableId: 1 });