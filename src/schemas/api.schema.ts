/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Api extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['GET', 'POST', 'PUT', 'DELETE'] })
  method: string;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Table' })
  tableId: Types.ObjectId;

  @Prop({ required: true, enum: ['insert', 'update', 'delete'] })
  action: string; // Removed findOne, findAll, aggregate

  @Prop() // Kept but unused in logic
  queryField: string;

  @Prop({
    type: [
      {
        name: String,
        action: { type: String, enum: ['findOne', 'findAll', 'aggregate'] },
      },
    ],
    default: [],
  })
  params: { name: string; action: 'findOne' | 'findAll' | 'aggregate' }[];

  @Prop({ default: false })
  returnIdOnly: boolean;

  @Prop({ default: false })
  returnUpdated: boolean;

  @Prop({ default: false })
  returnCount: boolean;
}

export const ApiSchema = SchemaFactory.createForClass(Api);

// Index for faster lookup by userId and path
ApiSchema.index({ userId: 1, path: 1 });
