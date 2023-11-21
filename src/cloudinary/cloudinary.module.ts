import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary/cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';
import { ProductRepository } from 'src/shared/entities/product.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Products, productSchema } from 'src/shared/schema/products';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Products.name, schema: productSchema }]),
  ],
  providers: [CloudinaryProvider, CloudinaryService, ProductRepository],
  exports: [CloudinaryProvider, CloudinaryService],
})
export class CloudinaryModule {}
