import { BadRequestException, Injectable } from '@nestjs/common';
import { CheckOutDtoArray } from './dto/checkOut.dto';
import { ProductRepository } from 'src/shared/entities/product.repository';
import { LicenseRepository } from 'src/shared/entities/license.repository';
import { OrderRepository } from 'src/shared/entities/order.repository';
import { UserRepository } from 'src/shared/entities/user.repository';
import Stripe from 'stripe';
import { UserTypes } from 'src/shared/schema/user';
import { orderStatus, paymentStatus } from 'src/shared/schema/order';
import { mailSender } from 'src/shared/utilities/mailHandler';

const stripe = new Stripe(
  'sk_test_51O91fcAm1nn4U9G7gMF0zsefxfr5T4VYStyzB7CFng5sDn36y3Cvgo7V1DelxyXcu8FJZaT1yPXxbODD6kF5eZwZ00X3URUiOm',
);

@Injectable()
export class OrdersService {
  constructor(
    private readonly productModelService: ProductRepository,
    private readonly orderModelService: OrderRepository,
    private readonly userModelService: UserRepository,
    private readonly licenseModelService: LicenseRepository,
  ) {}

  async create(createOrderDto: Record<string, any>) {
    // Check order exist with sessionId
    const orderExists = await this.orderModelService.findOne({
      checkoutSessionId: createOrderDto.checkoutSessionId,
    })
    if (orderExists) return orderExists;
    
    // Create orderObject in DB
    return await this.orderModelService.create(createOrderDto);
  }

  async checkOut(dto: CheckOutDtoArray, user: any) {
    const lineItems = []
    const cartItems = dto.checkOutDetails
    
    for (const item of cartItems) {
      const licenseExistance = await this.licenseModelService.findAll({productSku: item.skuId, isSold: false})

      if (licenseExistance.length >= item.quantity && item.quantity !== 0) {
        lineItems.push({
          price: item.skuPriceId,
          quantity: item.quantity,
          adjustable_quantity: {
            enabled: true,
            maximum: 5,
            minimum: 1
          }
        })
        console.log(lineItems)
      } else {
        throw new BadRequestException('These products are not available right now')
      }
    }
    if (lineItems.length === 0) throw new Error('There is no item in cart')

    // Making stripe session
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      metadata: {userId: user._id},
      payment_method_types: ['card'],
      mode: 'payment',
      billing_address_collection: 'required',
      phone_number_collection: {enabled: true},
      customer_email: user.email,
      success_url: process.env.SUCCESSURL,
      cancel_url: process.env.CANCELURL
    })

    return {
      success: true,
      message: 'Payment checkOut session successfully created',
      result: session.url
    }
  }
  
  async findAll(status: string, user: Record<string, any>) {
    // Find user details
    const userDetails = await this.userModelService.findOne({_id: user.id})

    // Build query for finding order
    const query = {} as Record<string, any>
    if (userDetails.type === UserTypes.COSTUMER) query.userId = user.id
    if (status) query.orderStatus = status

    // Find user's orders
    const userOrder = await this.orderModelService.findAll(query)

    return {
      success: true,
      message: "Fetch all user's orders successfully done",
      result: userOrder
    }
  }

  async findOne(_id: string) {
    // Find order by id
    const singleOrder = await this.orderModelService.findOne({_id})

    return {
      success: true,
      message: "Fetch one order successfully done" ,
      result: singleOrder
    }
  }

  async webhook(rawBody: Buffer, sig: string) {
    let event: any
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch(err) {
      throw new BadRequestException('Webhook Error: ', err)
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const orderData = await this.createOrderObject(session)
      const order: any = await this.create(orderData)

      if (session.payment_status === paymentStatus.paid) {
        if (order.orderStatus !== orderStatus.completed) {
          for (const item of order.orderedItems) {
            const licenses = await this.getLicense(orderData.orderId, item);
            item.licenses = licenses;
          }
        }
        this.orderModelService.findOneAndUpdate(
          {_id: session.id},
          {orderStatus: orderStatus.completed, isOrderDelivered: true, ...orderData}
        ).then(res => mailSender(orderData.customerEmail))
      }
    }
  }

  async getLicense(orderId: string, item: Record<string, any>) {
    // Find product and its sku
    const product: any = await this.productModelService.findOne({_id: item.productId})
    const skuDetails = await product.skuDetails.find(eachSku => eachSku.skuCode === item.skuCode)

    // Find product sku license
    const licenses = await this.licenseModelService.findAll({productSku: skuDetails._id, isSold: false}, item.quantity)
    const licenseIds = licenses.map(eachObj => eachObj._id)

    // Spdate some stuff in license model
    await this.licenseModelService.updateManyLicense({_id: {$in: licenseIds}}, {isSold: true, orderId})

    return licenses.map(each => each.licenseKey)
  }

  private async createOrderObject(session: Stripe.Checkout.Session) {
    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
      );
      const orderData = {
        orderId: Math.floor(new Date().valueOf() * Math.random()) + '',
        userId: session.metadata?.userId?.toString(),
        customerAddress: session.customer_details?.address,
        customerEmail: session.customer_email,
        customerPhoneNumber: session.customer_details?.phone,
        paymentInfo: {
          paymentMethod: session.payment_method_types[0],
          paymentIntentId: session.payment_intent,
          paymentDate: new Date(),
          paymentAmount: session.amount_total / 100,
          paymentStatus: session.payment_status,
        },
        orderDate: new Date(),
        checkoutSessionId: session.id,
        orderedItems: lineItems.data.map((item) => {
          item.price.metadata.quantity = item.quantity + '';
          return item.price.metadata;
        }),
      };
      return orderData;
    } catch (error) {
      throw error;
    }
  }
}
