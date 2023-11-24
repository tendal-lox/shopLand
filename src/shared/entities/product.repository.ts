import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Products } from '../schema/products';
import { Injectable } from '@nestjs/common';
import { GetAllProductDto } from 'src/products/dto/getAll-query.dto';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectModel(Products.name) private readonly productsModel: Model<Products>,
  ) {}

  async findOne(query: any) {
    try {
      return await this.productsModel.findById(query);
    } catch (err) {
      throw new Error('Error happend find upadte product');
    }
  }

  async create(query: any) {
    const ceatedProducts = new this.productsModel(query);
    return ceatedProducts.save();
  }

  async updateOne(query: any, data: any) {
    try {
      return await this.productsModel.findOneAndUpdate(query, data);
    } catch (err) {
      throw new Error(`Error happend during upadte product: ${err}`);
    }
  }

  async findOneAndDelete(query: { _id: string }) {
    try {
      return await this.productsModel.findOneAndDelete(query);
    } catch (err) {
      throw new Error(err);
    }
  }

  async findWithGroupBy() {
    return await this.productsModel.aggregate([
      {
        $facet: {
          latestProducts: [{ $sort: { createdAt: -1 } }, { $limit: 4 }],
          topRatedProducts: [{ $sort: { avgRating: -1 } }, { $limit: 8 }],
        },
      },
    ]);
  }

  async findAll(page: number, query: GetAllProductDto) {
    const products = await this.productsModel.aggregate([
      {
        $match: {
          productName: new RegExp(query.search),
          platformType: new RegExp(query.platformType),
          baseType: new RegExp(query.baseType),
        },
      },
      { $sort: { _id: 1 } },
      { $skip: (page - 1) * 1 },
      { $limit: 1 },
    ]);

    const maxPage = await this.productsModel.countDocuments({
      productName: new RegExp(query.search),
      platformType: new RegExp(query.platformType),
      baseType: new RegExp(query.baseType),
    });

    return { products, maxPage };
  }

  async findRelatedProducts(query: { category: string; _id: string }) {
    try {
      return await this.productsModel
        .find({ category: query.category, _id: { $ne: query._id } })
        .limit(1);
    } catch (err) {
      throw new Error(err);
    }
  }
}
