import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { OrderStatus, Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserType } from '../auth/dto/user.type';
import { OrderType } from '../orders/dto/order.type';
import { AdminService } from './admin.service';
import { AdminStatsType } from './dto/admin-stats.type';
import { UpdateUserRoleInput } from './dto/update-user-role.input';

@UseGuards(GqlAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Resolver()
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  @Query(() => [UserType])
  adminUsers(
    @Args('take', { type: () => Int, nullable: true }) take?: number,
  ): Promise<UserType[]> {
    return this.adminService.users(take);
  }

  @Mutation(() => UserType)
  adminSetUserRole(
    @Args('input') input: UpdateUserRoleInput,
  ): Promise<UserType> {
    return this.adminService.setUserRole(input);
  }

  @Query(() => AdminStatsType)
  adminStats(): Promise<AdminStatsType> {
    return this.adminService.stats();
  }

  @Query(() => [OrderType])
  adminOrders(
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('status', { type: () => OrderStatus, nullable: true })
    status?: OrderStatus,
  ): Promise<OrderType[]> {
    return this.adminService.orders(take, status);
  }
}
