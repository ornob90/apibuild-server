/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { MongoDBID } from 'src/types/schema.types';

@Schema()
export class Project extends Document {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  projectName: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
export type ProjectDocument = Project & Document & MongoDBID;

// Index for faster lookup by userId
ProjectSchema.index({ userId: 1 });
