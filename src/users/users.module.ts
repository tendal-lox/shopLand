import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepository } from '../shared/entities/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, userSchema } from '../shared/schema/user';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthTokenService } from '../shared/utilities/generateToken';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: Users.name, schema: userSchema }]),
    JwtModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, AuthTokenService],
})
export class UsersModule {}
