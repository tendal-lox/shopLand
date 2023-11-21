import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Orders } from "../schema/order";
import { Model } from "mongoose";

@Injectable()
export class OrderRepository {
  constructor(
    @InjectModel(Orders.name) private readonly orderModel: Model<Orders>,
  ) {}

  async findAll(query: any) {
    try{
        return await this.orderModel.find(query)
    } catch(err) {
        throw new Error(err)
    }
  }

  async findOne(query: any) {
    try{
        return await this.orderModel.find(query)
    } catch(err) {
        throw new Error(err)
    }
  }

  async create(query: any) {
    try{
        const result = await this.orderModel.create(query)
        return result.save()
    } catch(err) {
        throw new Error(err)
    }
  }

  async findOneAndUpdate(query: {_id: string}, data: any) {
    try{
      return await this.orderModel.findOneAndUpdate(query, data)
    } catch(err) {
      throw new Error(err)
    }
  }
}