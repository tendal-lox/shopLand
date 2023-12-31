import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  baseType,
  categoryType,
  platformType,
} from '../../shared/schema/products';
import { SkuDetails } from '../../shared/schema/skuDetails';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  image?: string;

  @IsOptional()
  imageDetails?: Record<string, any>;

  @IsString()
  @IsNotEmpty()
  @IsEnum(categoryType)
  category: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(platformType)
  platformType: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(baseType)
  baseType: string;

  @IsString()
  @IsNotEmpty()
  productUrl: string;

  @IsString()
  @IsNotEmpty()
  downloadUrl: string;

  @IsArray()
  @IsNotEmpty()
  requirementSpecification: Record<string, any>[];

  @IsArray()
  @IsNotEmpty()
  highLights: string[];

  @IsOptional()
  @IsArray()
  skuDetails?: SkuDetails[];

  @IsOptional()
  stripeProductId?: string;
}
