import { SetMetadata } from '@nestjs/common';

export enum Roles {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export const Role = (...roles: Roles[]) => SetMetadata('role', roles);

export const Public = () => SetMetadata('public', true);
