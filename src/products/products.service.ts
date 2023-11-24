import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductRepository } from 'src/shared/entities/product.repository';
import Stripe from 'stripe';
import async from 'async';
import { Products } from 'src/shared/schema/products';
import { GetAllProductDto } from './dto/getAll-query.dto';
import { ProductSkuDto, ProductSkuDtoArray } from './dto/product-sku.dto';
import { LicenseRepository } from 'src/shared/entities/license.repository';
import { OrderRepository } from 'src/shared/entities/order.repository';

const stripe = new Stripe(
  'sk_test_51O91fcAm1nn4U9G7gMF0zsefxfr5T4VYStyzB7CFng5sDn36y3Cvgo7V1DelxyXcu8FJZaT1yPXxbODD6kF5eZwZ00X3URUiOm',
);

export interface returnObject {
  success: boolean;
  message: string;
  result: Products;
}

@Injectable()
export class ProductsService {
  logger = new Logger(ProductsService.name);

  constructor(
    private readonly productModelService: ProductRepository,
    private readonly licenseModelService: LicenseRepository,
    private readonly orderModelService: OrderRepository,
  ) {}

  async create(dto: CreateProductDto): Promise<returnObject> {
    // Create product in stripe
    if (!dto.stripeProductId) {
      const createdProductInStripe = await stripe.products.create(
        {
          name: dto.productName,
          description: dto.description,
        },
        {
          apiVersion: '2023-10-16',
        },
      );
      dto.stripeProductId = createdProductInStripe.id;
    }

    // Create products in DB
    const createdProductInDB = await this.productModelService.create(dto);

    return {
      success: true,
      message: 'Product created successfully',
      result: createdProductInDB,
    };
  }

  async findAllProducts(
    page: number,
    query: GetAllProductDto,
    homePage: string,
  ) {
    let callForHomePage = false;
    if (query.homePage) callForHomePage = true;
    delete query.homePage;

    // Find specific products for home page
    if (callForHomePage) {
      const products = await this.productModelService.findWithGroupBy();
      return {
        success: true,
        message:
          products.length > 0
            ? 'Products fetched successfully'
            : 'No products found',
        result: products,
      };
    }

    // Find all products
    const { products, maxPage } = await this.productModelService.findAll(
      page,
      query,
    );
    return {
      success: true,
      message:
        products.length > 0
          ? 'Products fetched successfully'
          : 'No products found',
      result: { products, maxPage },
    };
  }

  async findOne(_id: string): Promise<any> {
    const product: Products = await this.productModelService.findOne({ _id });
    if (!product) throw new NotFoundException('Product not found');

    const relatedProducts: Products[] =
      await this.productModelService.findRelatedProducts({
        category: product.category,
        _id,
      });

    return {
      success: true,
      message: 'Product Found',
      result: { product, relatedProducts },
    };
  }

  async update(_id: string, dto: UpdateProductDto) {
    // Check user exist
    const product = await this.productModelService.findOne({ _id });
    if (!product) throw new NotFoundException();

    // Update product in DB and stripe(kicking-off I/O)
    const result = await async.parallel([
      async () => {
        return await this.productModelService.updateOne({ _id }, { ...dto });
      },
      async () => {
        if (!dto.stripeProductId)
          return await stripe.products.update(product.stripeProductId, {
            name: dto.productName,
            description: dto.description,
          });
        return;
      },
    ]);

    return {
      success: true,
      message: 'Product updated successfully',
      result: result,
    };
  }

  async remove(_id: string): Promise<returnObject> {
    // Check product exist and remove it
    const deletedProductFromDB =
      await this.productModelService.findOneAndDelete({ _id });
    if (!deletedProductFromDB) throw new NotFoundException('Product not found');

    // Delete record in stripe
    try {
      const deletedProductFromStripe = await stripe.products.del(
        deletedProductFromDB._id,
      );
      this.logger.log(deletedProductFromStripe);
    } catch (err) {
      throw new Error(
        `Error happend during delete product from stripe: ${err}`,
      );
    }

    return {
      success: true,
      message: 'Product deleted successfully',
      result: deletedProductFromDB,
    };
  }

  async updateProductImage(_id: string, cloudinaryRes: any) {
    // Check product exist
    const product = await this.productModelService.findOne({ _id });
    if (!product) throw new NotFoundException('Product Not Found');

    const result = await async.parallel([
      async () => {
        // Update image in DB
        return await this.productModelService.updateOne(
          { _id },
          { imageDetails: cloudinaryRes, image: cloudinaryRes.secure_url },
        );
      },
      async () => {
        // Update image in stripe
        return await stripe.products.update(product.stripeProductId, {
          images: [cloudinaryRes.secure_url],
        });
      },
    ]);

    return {
      success: true,
      message: 'Image uploaded successfully',
      result: result,
    };
  }

  async addProductSku(_id: string, dto: ProductSkuDtoArray) {
    // Check product exist
    const product = await this.productModelService.findOne({ _id });
    if (!product) throw new NotFoundException('Product Not Found');

    // Create price in stripe for array of sku details
    const skuCode = Math.random().toString(36).substring(2, 5) + Date.now();

    for (const sku of dto.skuDetails) {
      if (!sku.stripePriceId) {
        const stripePrice = await stripe.prices.create({
          unit_amount: sku.price * 100,
          currency: 'eur',
          product: product.stripeProductId,
          metadata: {
            skuCode: skuCode,
            lifeTime: sku.lifeTime + '',
            productId: _id,
            price: sku.price,
            productName: product.productName,
            productImage: product.image,
          },
        });
        sku.stripePriceId = stripePrice.id;
      }
      sku.skuCode = skuCode;
    }

    // Add product in DB
    const updatedProduct = await this.productModelService.updateOne(
      { _id },
      { $push: { skuDetails: dto.skuDetails } },
    );

    return {
      success: true,
      message: 'Product updated successfully',
      result: updatedProduct,
    };
  }

  async updateOneSkuById(_id: string, skuId: string, dto: ProductSkuDto) {
    // Check product exist
    const product: any = await this.productModelService.findOne({ _id });
    if (!product) throw new NotFoundException('Product Not Found');

    // Check sku code exist
    const skuDetails = product.skuDetails.find(
      (eachSku: any) => eachSku._id == skuId,
    );
    if (!skuDetails) throw new NotFoundException('Product sku Not Found');

    if (dto.price !== skuDetails.price) {
      const result = await async.parallel([
        async () => {
          // Update image in DB
          const dataForUpdate = {};
          for (const key in dto) {
            if (dto.hasOwnProperty(key))
              dataForUpdate[`skuDetails.$.${key}`] = dto[key];
          }
          return await this.productModelService.updateOne(
            { _id, 'skuDetails._id': skuId },
            { $set: dataForUpdate },
          );
        },
        async () => {
          // Update sku details in stripe
          return stripe.prices
            .create({
              unit_amount: dto.price * 100,
              currency: 'eur',
              product: product.stripeProductId,
              metadata: {
                skuCode: skuDetails.skuCode,
                lifeTime: dto.lifeTime + '',
                productId: _id,
                price: dto.price,
                productName: product.productName,
                productImage: product.image,
              },
            })
            .then((res) => {
              skuDetails.stripePriceId = res.id;
              return res;
            });
        },
      ]);

      return {
        success: true,
        message: 'Sku updated successfully',
        result: result,
      };
    }
  }

  async addLicense(productId: string, skuId: string, licenseKey: string) {
    // Check product exist
    const product: any = await this.productModelService.findOne({
      _id: productId,
    });
    if (!product) throw new NotFoundException('Product Not Found');

    // Check sku code exist
    const skuDetails = product.skuDetails.find(
      (eachSku: any) => eachSku._id == skuId,
    );
    if (!skuDetails) throw new NotFoundException('Product sku Not Found');

    // Add license to DB
    const licenseCreationResult = await this.licenseModelService.create(
      productId,
      skuId,
      licenseKey,
    );

    return {
      success: true,
      message: 'License created successfully',
      result: licenseCreationResult,
    };
  }

  async findProductSkuLicense(productId: string, skuId: string, page: number) {
    // Check product exist
    const product: any = await this.productModelService.findOne({
      _id: productId,
    });
    if (!product) throw new NotFoundException('Product Not Found');

    // Check sku code exist
    const skuDetails = product.skuDetails.find(
      (eachSku: any) => eachSku._id == skuId,
    );
    if (!skuDetails) throw new NotFoundException('Product sku Not Found');

    // Calling find all method from DB
    const allSkuLicense = await this.licenseModelService.findAll(
      { product: productId, productSku: skuId },
    );

    return {
      success: true,
      message: 'Licenses fetched successfully',
      result: allSkuLicense,
    };
  }

  async deleteLicense(licenseId: string) {
    // Delete if license exist
    const deleteLicenseResult =
      await this.licenseModelService.findOneAndDelete(licenseId);

    return {
      success: true,
      message: 'License deleted successfully',
      result: deleteLicenseResult,
    };
  }

  async updateLicense(_id: string, licenseKey: string) {
    // Update license key with licenseId
    const updatedLicense = await this.licenseModelService.findOneAndUpdate(
      { _id },
      { licenseKey },
    );
    if (!updatedLicense) throw new NotFoundException('License Not Found');

    return {
      success: true,
      message: 'License deleted successfully',
      result: updatedLicense,
    };
  }
  
  async addProductReview(productId: string, review: string, rating: number, user: Record<string, any>) {
    // Check product existance
    const product: any = await this.productModelService.findOne({
      _id: productId,
    });
    if (!product) throw new NotFoundException('Product Not Found');

    // Check if user gave the review for the product
    const reviewStatus = await product.feedbackDetails.find(eachReview => eachReview.customerId === user.id)
    if (!reviewStatus) throw new Error('You have already gave the feedback')

    // check if user ordered the product
    const userOrders = await this.orderModelService.findAll({userId: user.id})
    const isOrdered = userOrders.some(eachOrder => eachOrder.orderedItems.some(eachItems => eachItems.productId === productId))
    if (!isOrdered) throw new NotFoundException('You have not purchased this product')

    // Calculating avg-rating
    const ratings = []
    product.feedbackDetails.forEach(eachFeedback => ratings.push(eachFeedback.rating))

    let avgRating: number
    if (ratings.length > 0) {
      avgRating = +(ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length).toFixed(2)
    }

    // Update stuff in product DB
    const feedbackDetails = {
      feedbackMsg: review,
      rating: rating,
      customerId: user.id,
      customerName: user.name
    }
    const result = await this.productModelService.updateOne(
      {_id: productId},
      {$set: {avgRating}, $push: {feedbackDetails}}
    )

    return {
      success: true,
      message: 'review added successfully',
      result
    }
  }

  async deleteProductReview(reviewId: string, productId: string) {
    // Check if product exist
    const product: any = await this.productModelService.findOne({_id: productId})
    if (!product) throw new NotFoundException('Product not found')

    // Check if feedBack exist
    const reviewExistance = product.feedbackDetails.some(eachFeedback => eachFeedback._id === reviewId)
    if (!reviewExistance) throw new NotFoundException('Feedback not found')

    // Calculating avg-rating
    const ratings = []
    product.feedbackDetails.forEach(eachFeedback => {
      if (eachFeedback._id !== reviewId) ratings.push(eachFeedback.rating)
    })
    let avgRating = +(ratings.reduce((acc, curr) => acc + curr), 0).toFixed(2)

    const result = await this.productModelService.updateOne(
      {_id: reviewId},
      {$set: avgRating, $pull: {feedbackDetails: {_id: reviewId}}}
    )

    return {
      success: true,
      message: 'Review deleted successfully',
      result
    }
  }
}
