import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthTokenService } from '../shared/utilities/generateToken';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [JwtStrategy],
})
export class AuthModule {}
