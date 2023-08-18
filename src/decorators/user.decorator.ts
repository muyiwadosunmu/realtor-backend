import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export interface UserInfo {
  name: string;
  id: number;
  iat: number;
  exp: number;
}

export const User = createParamDecorator((data, context: ExecutionContext) => {
  /**The callback function takes in 2 parameters
   * 1. incoming data->
   * 2. context (ExecutionContext)
   */
  const request = context.switchToHttp().getRequest();
  return request.user;
});
