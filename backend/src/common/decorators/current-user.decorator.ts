import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from '@prisma/client';

export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, context: ExecutionContext) => {
    const gqlContext = GqlExecutionContext.create(context);
    const user = gqlContext.getContext<{ req: { user?: RequestUser } }>().req
      .user;

    if (!data) {
      return user;
    }

    return user?.[data];
  },
);

export interface RequestUser {
  userId: string;
  email: string;
  role: Role;
}
