import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { ExtractJwt } from "passport-jwt";
import { AuthTokenService } from "../../shared/utilities/generateToken";
import * as process from "process";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly authTokenService: AuthTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // What is required roles
    const publicRole = this.reflector.getAllAndOverride('public', [
      context.getHandler(),
      context.getClass(),
    ]);
    const otherRoles = this.reflector.getAllAndOverride<RolesGuard[]>('role', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If there is no any role
    if (publicRole) return true

    // What is current request role
    const request = context.switchToHttp().getRequest();
    const token = (ExtractJwt.fromExtractors([(request: Request) => request?.cookies?.Authentication]))(request)
    if (!token) throw new UnauthorizedException('Your are not authorized')
    const { type } = await this.authTokenService.decodedToken(token, process.env.JWT_SECRET_KEY)

    // Check if user is verified
    for (const role of otherRoles) {
      if (type !== role) throw new UnauthorizedException('You Dont Have Access To This Route')
    }
    if (type === 'admin' || 'customer') return otherRoles.some(role => type.includes(role))
  }
}