import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ProductSkuDto {
  @IsString()
  @IsNotEmpty()
  skuName: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  validity: number;

  @IsBoolean()
  @IsNotEmpty()
  lifeTime: boolean;

  @IsString()
  @IsOptional()
  stripePriceId?: string;

  @IsString()
  @IsOptional()
  skuCode?: string;
}

export class ProductSkuDtoArray {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ProductSkuDto)
  @ArrayMinSize(1)
  skuDetails: ProductSkuDto[];
}
