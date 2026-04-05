import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface GqlRequestUser {
  role?: Role;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) {
      return true;
    }

    const user = this.getUser(context);

    if (!user?.role || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('You do not have access to this resource');
    }

    return true;
  }

  private getUser(context: ExecutionContext): GqlRequestUser | undefined {
    if (context.getType<'http' | 'graphql'>() === 'http') {
      return context.switchToHttp().getRequest<{ user?: GqlRequestUser }>()
        .user;
    }

    const gqlContext = GqlExecutionContext.create(context);
    return gqlContext.getContext<{ req: { user?: GqlRequestUser } }>().req.user;
  }
}
