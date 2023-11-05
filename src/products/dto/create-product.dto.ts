import { IsString } from "class-validator";

export class CreateProductDto {
  @IsString()
  productName: string

  description: string

  image: string

  category: string
}
