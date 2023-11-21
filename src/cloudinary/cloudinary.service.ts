import { Injectable, NotFoundException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary/cloudinary-response';
import * as streamifier from 'streamifier';
import { ProductRepository } from 'src/shared/entities/product.repository';

@Injectable()
export class CloudinaryService {
  constructor(private readonly productModelService: ProductRepository) {}

  async uploadFile(_id: string, file: Express.Multer.File): Promise<any> {
    // Check product exist
    const product = await this.productModelService.findOne({ _id });
    if (!product) throw new NotFoundException('Product Not Found');

    // Delete old image if exist
    if (product.imageDetails?.public_id)
      await cloudinary.uploader.destroy(product.imageDetails?.public_id, {
        invalidate: true,
      });

    // Cloudinary stuff
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
