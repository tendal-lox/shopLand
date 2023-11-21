import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Feedbacks extends mongoose.Document {
  @Prop()
  customerId: string;

  @Prop()
  customerName: string;

  @Prop()
  rating: number;

  @Prop()
  feedbackMsg: string;
}

export const feedbackSchema = SchemaFactory.createForClass(Feedbacks);
