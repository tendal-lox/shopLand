import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { License } from '../schema/license';

@Injectable()
export class LicenseRepository {
  constructor(
    @InjectModel(License.name) private readonly licenseModel: Model<License>,
  ) {}

  async create(product: string, productSku: string, licenseKey: string) {
    const ceatedProducts = new this.licenseModel({
      product,
      productSku,
      licenseKey,
    });
    return ceatedProducts.save();
  }

  async findOneAndUpdate(query: any, data: any) {
    try {
      return await this.licenseModel.findOneAndUpdate(query, data);
    } catch (err) {
      throw new Error(`Error happend during upadte license: ${err}`);
    }
  }

  async updateManyLicense(query: any, data: any) {
    try {
      return await this.licenseModel.updateMany(query, data);
    } catch (err) {
      throw new Error(`Error happend during upadte license: ${err}`);
    }
  }

  async findOneAndDelete(licenseId: string) {
    try {
      return await this.licenseModel.findOneAndDelete({ _id: licenseId });
    } catch (err) {
      throw new Error(err);
    }
  }

  async findAll(query: any, limit?: number) {
    if (limit && limit > 0) return await this.licenseModel.find(query).limit(limit)
    return await this.licenseModel.find(query)
  }
}
