import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { AuthService } from './auth.service';
import { AuthPayloadType } from './dto/auth-payload.type';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { UserType } from './dto/user.type';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayloadType)
  register(@Args('input') input: RegisterInput): Promise<AuthPayloadType> {
    return this.authService.register(input);
  }

  @Mutation(() => AuthPayloadType)
  login(@Args('input') input: LoginInput): Promise<AuthPayloadType> {
    return this.authService.login(input);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => UserType)
  me(@CurrentUser('userId') userId: string): Promise<UserType> {
    return this.authService.me(userId);
  }
}
