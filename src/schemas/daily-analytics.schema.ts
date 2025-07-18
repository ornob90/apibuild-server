/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { MongoDBID } from 'src/types/schema.types';

@Schema({ timestamps: true })
export class DailyAnalytics extends Document {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  date: Date;

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
}

export const DailyAnalyticsSchema =
  SchemaFactory.createForClass(DailyAnalytics);


export type DailyAnalyticsDocument = DailyAnalytics & Document & MongoDBID;

DailyAnalyticsSchema.index({ userId: 1, date: 1 }, { unique: true });
