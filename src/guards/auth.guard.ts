import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

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
        const user = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log({ user });
      } catch (error) {
        return false;
      }
    }
    return true;

    /**3. Database request to get user by their ID */
    /**4. Determine if the user has permissions */
    return true;
  }
}
