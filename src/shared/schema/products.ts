import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Feedbacks, feedbackSchema } from "./feedback";
import { SkuDetails, skuDetailSchema } from "./skuDetails";
import { Document } from "mongoose";

export enum categoryType {
  operatingSystem = 'Operating System',
  applicationSoftware = 'Application Software'
}

export enum platformType {
  windows = 'Windows',
  mac = 'Mac',
  linux = 'Linux',
  android = 'Android',
  ios = 'Ios'
}

export enum baseType {
  computer = 'Computer',
  mobile = 'Mobile'
}

@Schema({timestamps: true})
export class Products extends Document {
  @Prop({required: true})
  productName: string

  @Prop({required: true})
  description: string

  @Prop({required: true})
  image: string

  @Prop({required: true, enum: [categoryType.operatingSystem, categoryType.applicationSoftware]})
  category: string

  @Prop({required: true, enum: [platformType.ios, platformType.android, platformType.mac, platformType.windows, platformType.linux]})
  platformType: string

  @Prop({ required: true, enum: [baseType.computer, baseType.mobile] })
  baseType: string

  @Prop({required: true})
  productUrl: string

  @Prop({required: true})
  downloadUrl: string

  @Prop({})
  avgRating: number

  @Prop([{type: feedbackSchema}])
  feedbackDetails: Feedbacks

  @Prop([{type: skuDetailSchema}])
  skuDetails: SkuDetails

  @Prop({type: Object})
  imageDetails: Record<string, any>

  @Prop({required: true})
  requirementSpecification: Record<string, any>[]

  @Prop({required: true})
  highLights: string[]

  @Prop({required: true})
  stripeProductId: string
}

export const productSchema = SchemaFactory.createForClass(Products);
