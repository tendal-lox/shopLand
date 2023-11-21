import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Public, Role, Roles } from '../shared/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ProductSkuDto, ProductSkuDtoArray } from './dto/product-sku.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Role(Roles.ADMIN)
  @Post()
  async create(@Body() dto: CreateProductDto) {
    return await this.productsService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Public()
  @Get()
  findAll(
    @Query('page', ParseIntPipe) page: number,
    @Query('search') search: string,
    @Query('category') category: string,
    @Query('platformType') platformType: string,
    @Query('baseType') baseType: string,
    @Query('homePage') homePage: string,
  ) {
    return this.productsService.findAllProducts(
      page,
      { search, category, platformType, baseType },
      homePage,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Role(Roles.ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Role(Roles.ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Role(Roles.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.productsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Role(Roles.ADMIN)
  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file', { limits: { fieldSize: 3000000 } }))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const cloudinaryRes = await this.cloudinaryService.uploadFile(id, file);

    return await this.productsService.updateProductImage(id, cloudinaryRes);
  }

  @UseGuards(JwtAuthGuard)
  @Role(Roles.ADMIN)
  @Post(':productId/skus')
  async createProductSku(
    @Param('productId') id: string,
    @Body() dto: ProductSkuDtoArray,
  ) {
    console.log(dto);
    return await this.productsService.addProductSku(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Role(Roles.ADMIN)
  @Patch(':productId/sku/:skuId')
  async updateOneSkuById(
    @Param('productId') productId: string,
    @Param('skuId') skuId: string,
    @Body() dto: ProductSkuDto,
  ) {
    return await this.productsService.updateOneSkuById(productId, skuId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Role(Roles.ADMIN)
  @Post(':productId/sku/:skuId/license')
  async addLicense(
    @Param('productId') productId: string,
    @Param('skuId') skuId: string,
    @Body('licenseKey') licenseKey: string,
  ) {
    return await this.productsService.addLicense(productId, skuId, licenseKey);
  }

  @UseGuards(JwtAuthGuard)
  @Role(Roles.ADMIN)
  @Get(':productId/sku/:skuId/license')
  async findAllLicense(
    @Param('productId') productId: string,
    @Param('skuId') skuId: string,
    @Query('page') page: number,
  ) {
    return await this.productsService.findProductSkuLicense(
      productId,
      skuId,
      page,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Role(Roles.ADMIN)
  @Delete('licenses/:licenseId')
  async deleteLicense(@Param('licenseId') licenseId: string) {
    return await this.productsService.deleteLicense(licenseId);
  }

  @UseGuards(JwtAuthGuard)
  @Role(Roles.ADMIN)
  @Patch('licenses/:licenseId')
  async updateLicense(
    @Param('licenseId') licenseId: string,
    @Body('newLicenseKey') newLicenseKey: string,
  ) {
    return await this.productsService.updateLicense(licenseId, newLicenseKey);
  }
}
