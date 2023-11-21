import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Products, productSchema } from 'src/shared/schema/products';
import { ProductRepository } from 'src/shared/entities/product.repository';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { License, LicenseSchema } from 'src/shared/schema/license';
import { LicenseRepository } from 'src/shared/entities/license.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Products.name, schema: productSchema }]),
    MongooseModule.forFeature([{ name: License.name, schema: LicenseSchema }]),
    CloudinaryModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductRepository, LicenseRepository],
})
export class ProductsModule {}
