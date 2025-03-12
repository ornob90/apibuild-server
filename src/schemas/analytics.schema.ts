/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { MongoDBID } from 'src/types/schema.types';

@Schema({ timestamps: true })
export class Analytics extends Document {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Schema.Types.ObjectId

  @Prop({ default: 0 })
  apiCalls: number;

  @Prop({ default: 0 })
  projectsCreated: number;

  @Prop({ default: 0 })
  tablesCreated: number;

  @Prop({ default: 0 })
  tokensGenerated: number;

  @Prop({ default: 0 })
  failedApiCalls: number;

  @Prop() // Provided by timestamps
  createdAt: Date;

  @Prop() // Provided by timestamps
  updatedAt: Date;
}

export type AnalyticsDocument = Analytics & Document & MongoDBID;
export const AnalyticsSchema = SchemaFactory.createForClass(Analytics);

// Index for faster lookup by userId
AnalyticsSchema.index({ userId: 1 });