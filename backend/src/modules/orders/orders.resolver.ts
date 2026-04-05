import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CreateOrderInput } from './dto/create-order.input';
import { OrderType } from './dto/order.type';
import { OrdersService } from './orders.service';

@Resolver(() => OrderType)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [OrderType])
  myOrders(
    @CurrentUser() user: RequestUser,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
  ): Promise<OrderType[]> {
    return this.ordersService.listByUser(user.userId, take ?? 30);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => OrderType)
  myOrder(
    @CurrentUser() user: RequestUser,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<OrderType> {
    return this.ordersService.getByIdForUser(user.userId, id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => OrderType)
  createMyOrder(
    @CurrentUser() user: RequestUser,
    @Args('input') input: CreateOrderInput,
  ): Promise<OrderType> {
    return this.ordersService.createByUser(user.userId, input);
  }
}
