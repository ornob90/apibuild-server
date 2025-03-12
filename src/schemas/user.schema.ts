/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MongoDBID } from 'src/types/schema.types';

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: [true, 'Username is required'],
    unique: true,
    minlength: [3, 'Username must be at least 3 characters long'],
  })
  userName: string;

  @Prop({
    required: [true, 'Display Name is required'],
    minlength: [3, 'Display Name must be at least 3 characters long'],
  })
  displayName: string;

  @Prop({
    required: [true, 'Email is required'],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  })
  email: string;

  @Prop({
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  })
  password: string;

  @Prop({
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'],
  })
  phone?: string;

  @Prop({ default: null })
  photoUrl?: string;

  @Prop({ default: 'inactive', enum: ['active', 'inactive'] })
  status: string;
}

export type UserDocument = User & Document & MongoDBID;
export const UserSchema = SchemaFactory.createForClass(User);
