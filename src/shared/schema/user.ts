import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserTypes {
  ADMIN = 'admin',
  COSTUMER = 'customer',
}

@Schema({ timestamps: true })
export class Users extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: [UserTypes.ADMIN, UserTypes.COSTUMER] })
  type: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: null })
  otp: string;

  @Prop({ default: null })
  otpExpiryTime: Date;
}

export const userSchema = SchemaFactory.createForClass(Users);
