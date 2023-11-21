import { Type } from "class-transformer"
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator"

export class CheckOutDto {
    @IsString()
    @IsNotEmpty()
    skuPriceId: string

    @IsNumber()
    @IsNotEmpty()
    quantity: number

    @IsString()
    @IsNotEmpty()
    skuId: string
}

export class CheckOutDtoArray {
    @IsArray()
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => CheckOutDto)
    @ArrayMinSize(1)
    checkOutDetails: CheckOutDto[]
}