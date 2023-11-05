import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import * as process from 'process';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { HttpExceptionFilter } from './exception-filters/httpExceptionFilter';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { UsersService } from "./users/users.service";
import { RolesGuard } from "./auth/guards/roles.guard";
import { AuthTokenService } from "./shared/utilities/generateToken";
import { JwtService } from "@nestjs/jwt";
import { ProductsModule } from './products/products.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    UsersModule,
    AuthModule,
    ProductsModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthTokenService,
    JwtService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    {provide: APP_GUARD, useClass: RolesGuard}
  ],
})
export class AppModule {}
