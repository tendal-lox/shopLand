import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserTypes } from '../../shared/schema/user';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([UserTypes.ADMIN, UserTypes.COSTUMER])
  type: string;

  @IsString()
  @IsOptional()
  secretToken?: string;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;
}

export class UserLoginDto {
  @IsString()
  email: string;

  @IsString()
  password: string;
}
