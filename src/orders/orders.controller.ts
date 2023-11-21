import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Req,
  Headers,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Role, Roles } from 'src/shared/decorators/roles.decorator';
import { Request } from 'express';
import { CheckOutDtoArray } from './dto/checkOut.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Role(Roles.ADMIN)
  @Post('checkout')
  async checkOut(
    @Req() req: Request,
    @Body() dto: CheckOutDtoArray
  ) {
    return await this.ordersService.checkOut(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Role(Roles.ADMIN)
  @Get()
  async findAll(
    @Query('status') status: string,
    @Req() req: Request
  ) {
    return await this.ordersService.findAll(status, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Role(Roles.ADMIN)
  @Get(':id')
  async findOne(@Param('orderId') orderId: string) {
    return await this.ordersService.findOne(orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Role(Roles.ADMIN)
  @Post('webhook')
  async webhook(
    @Body() rawBody: Buffer,
    @Headers('stripe-signature') sig: string
  ) {
    return await this.ordersService.webhook(rawBody, sig);
  }
}
