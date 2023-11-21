import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export enum paymentStatus {
  pending = 'pending',
  paid = 'paid',
  faild = 'faild',
}

export enum orderStatus {
  pending = 'pending',
  completed = 'completed',
}

export class OrderedItems {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  skuCode: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  lifeTime: boolean;

  @Prop({ required: true })
  validity: number;

  @Prop({ required: true })
  skuPriceId: string;

  @Prop({ required: true })
  productName: string;

  @Prop({ default: [] })
  licenses: string[];
}

@Schema({ timestamps: true })
export class Orders extends Document {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  userId: string;

  @Prop({ required: true, type: Object })
  customerAddress: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };

  @Prop({ required: true })
  customerPhoneNumber: string;

  @Prop({ required: true })
  orderedItems: OrderedItems[];

  @Prop({ required: true, type: Object })
  paymentInfo: {
    paymentMethod: string;
    paymentStatus: paymentStatus;
    paymentAmount: number;
    paymentDate: Date;
    paymentIntentId: string;
  };

  @Prop({ default: orderStatus.pending })
  orderStatus: orderStatus;

  @Prop({ default: false })
  isOrderDelivered: boolean;

  @Prop({ default: null })
  checkoutSessionId: string;
}
export const OrderSchema = SchemaFactory.createForClass(Orders);
