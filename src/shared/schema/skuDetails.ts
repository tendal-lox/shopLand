import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class SkuDetails extends mongoose.Document {
  @Prop()
  skuName: string;

  @Prop()
  price: number;

  @Prop()
  validity: number;

  @Prop()
  lifeTime: boolean;

  @Prop()
  stripePriceId: string;

  @Prop()
  skuCode: string;
}

export const skuDetailSchema = SchemaFactory.createForClass(SkuDetails);
