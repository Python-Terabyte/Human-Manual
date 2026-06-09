import {
  CanActivate, ExecutionContext, Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as admin from 'firebase-admin';
import type { Request } from 'express';

export const IS_PUBLIC_KEY = 'isPublic';

/** Mark a route as public (no Firebase token required) */
export const Public = () =>
  (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(IS_PUBLIC_KEY, true, descriptor.value);
    return descriptor;
  };

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token   = this.extractToken(request);

    if (!token) throw new UnauthorizedException('Missing Bearer token');

    try {
      const decoded = await admin.auth().verifyIdToken(token);
      (request as any).firebaseUser = decoded;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(req: Request): string | null {
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) return auth.slice(7);
    return null;
  }
}
