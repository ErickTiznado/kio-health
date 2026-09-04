import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { RequestUser } from '../interfaces/request-user.interface';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestUser =>
    ctx.switchToHttp().getRequest<Request>().user as RequestUser,
);
