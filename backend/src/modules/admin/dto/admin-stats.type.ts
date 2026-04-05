import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AdminStatsType {
  @Field(() => Int)
  usersCount: number;

  @Field(() => Int)
  adminsCount: number;

  @Field(() => Int)
  ordersCount: number;

  @Field()
  totalRevenue: string;
}
