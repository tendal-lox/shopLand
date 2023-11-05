import { JwtService } from '@nestjs/jwt';
import * as process from 'process';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthTokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(payload: any) {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_KEY,
    });
  }

  async decodedToken(token: string, secret: string) {
    return this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET_KEY,
    });
  }
}
