/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { MongoDBID } from 'src/types/schema.types';

@Schema({ timestamps: true })
export class Token extends Document {
  // _id automatically provided by Mongoose as ObjectId

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Schema.Types.ObjectId

  @Prop({ required: true })
  tokenHash: string;

  // @Prop({ required: true })
  // name: string;

  @Prop({ default: true })
  active: boolean;

  @Prop() // Provided by timestamps option
  createdAt: Date;
}

export type TokenDocument = Token & Document & MongoDBID;
export const TokenSchema = SchemaFactory.createForClass(Token);

// Index for faster lookup by userId
TokenSchema.index({ userId: 1 });
