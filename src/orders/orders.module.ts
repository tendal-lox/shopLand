import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderSchema, Orders } from 'src/shared/schema/order';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderRepository } from 'src/shared/entities/order.repository';
import { UserRepository } from 'src/shared/entities/user.repository';
import { ProductRepository } from 'src/shared/entities/product.repository';
import { Products, productSchema } from 'src/shared/schema/products';
import { LicenseRepository } from 'src/shared/entities/license.repository';
import { License, LicenseSchema } from 'src/shared/schema/license';
import { Users, userSchema } from 'src/shared/schema/user';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Orders.name, schema: OrderSchema }]),
    MongooseModule.forFeature([{ name: Products.name, schema: productSchema }]),
    MongooseModule.forFeature([{ name: License.name, schema: LicenseSchema }]),
    MongooseModule.forFeature([{ name: Users.name, schema: userSchema }]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderRepository, UserRepository, ProductRepository, LicenseRepository],
})
export class OrdersModule {}
