import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'src/prisma/prisma.service';

interface JWTPayload {
  name: string;
  id: number;
  exp: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prismaService: PrismaService,
  ) {}

  ///////////////////
  async canActivate(context: ExecutionContext) {
    /**1. Determine the UserType that can execute endpoint */
    const roles = this.reflector.getAllAndOverride('roles', [
      // We want to  get the metadata from the request
      context.getHandler(),
      context.getClass(),
    ]);
    console.log({ roles });
    /**2. Grab the JWT from the request header and verify it, ONLY IF roles exist in the metadata */
    if (roles?.length) {
      const request = context.switchToHttp().getRequest<Request>();
      const token = request.headers?.authorization?.split(' ')[1];
      try {
        const payload = (await jwt.verify(
          token,
          process.env.JWT_SECRET_KEY,
        )) as JWTPayload;
        /**3. Database request to get user by their ID */
        const user = await this.prismaService.user.findUnique({
          where: {
            id: payload.id,
          },
        });
        if (!user) return false;
        console.log({ user });
        // Check for user role
        if (roles.includes(user.user_type)) {
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    }
    /**4. Determine if the user has permissions */
    return true;
  }
}
