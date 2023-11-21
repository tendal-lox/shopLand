import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Feedbacks, feedbackSchema } from './feedback';
import { SkuDetails, skuDetailSchema } from './skuDetails';
import { Document } from 'mongoose';

export enum categoryType {
  operatingSystem = 'Operating System',
  applicationSoftware = 'Application Software',
}

export enum platformType {
  windows = 'Windows',
  mac = 'Mac',
  linux = 'Linux',
  android = 'Android',
  ios = 'Ios',
}

export enum baseType {
  computer = 'Computer',
  mobile = 'Mobile',
}

@Schema({ timestamps: true })
export class Products extends Document {
  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    default:
      'https://st4.depositphotos.com/14953852/24787/v/450/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg',
  })
  image: string;

  @Prop({
    required: true,
    enum: [categoryType.operatingSystem, categoryType.applicationSoftware],
  })
  category: string;

  @Prop({
    enum: [
      platformType.ios,
      platformType.android,
      platformType.mac,
      platformType.windows,
      platformType.linux,
    ],
  })
  platformType: string;

  @Prop({ required: true, enum: [baseType.computer, baseType.mobile] })
  baseType: string;

  @Prop({ required: true })
  productUrl: string;

  @Prop({ required: true })
  downloadUrl: string;

  @Prop({})
  avgRating: number;

  @Prop([{ type: feedbackSchema }])
  feedbackDetails: Feedbacks;

  @Prop([{ type: skuDetailSchema }])
  skuDetails: SkuDetails;

  @Prop({ type: Object })
  imageDetails: Record<string, any>;

  @Prop()
  requirementSpecification: Record<string, any>[];

  @Prop()
  highLights: string[];

  @Prop({})
  stripeProductId: string;
}

export const productSchema = SchemaFactory.createForClass(Products);
