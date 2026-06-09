import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { DecodedIdToken } from 'firebase-admin/auth';

/** Injects the Firebase decoded token into the route handler */
export const FirebaseUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): DecodedIdToken => {
    const request = ctx.switchToHttp().getRequest();
    return request.firebaseUser;
  },
);

/** Injects the DB User record (set by AuthService.syncUser) */
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.dbUser;
  },
);
