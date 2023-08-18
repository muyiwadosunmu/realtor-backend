import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

export class UserInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    handler: CallHandler,
    /**context-> gives info about the request, handler -> allows us to reach the route handler*/
  ) {
    const request = context.switchToHttp().getRequest();
    const token = request?.headers?.authorization.split(' ')[1];
    // console.log({ token });
    const user = await jwt.decode(token);
    // console.log({ user });
    request.user = user;

    //Code above here affets the Request
    return handler.handle();
    //Code below here affects the Response
  }
}

/**
 * 
 * 
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`After... ${Date.now() - now}ms`)),
      );
  }
}

 */
