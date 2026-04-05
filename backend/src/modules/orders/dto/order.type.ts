import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { OrderStatus, PaymentMethod } from '@prisma/client';
import { OrderItemType } from './order-item.type';

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
});
registerEnumType(PaymentMethod, {
  name: 'PaymentMethod',
});

@ObjectType('Order')
export class OrderType {
  @Field(() => ID)
  id: string;

  @Field()
  displayNumber: string;

  @Field()
  userId: string;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => PaymentMethod)
  paymentMethod: PaymentMethod;

  @Field()
  customerName: string;

  @Field()
  customerPhone: string;

  @Field()
  deliveryCity: string;

  @Field()
  deliveryAddress: string;

  @Field(() => String, { nullable: true })
  comment?: string | null;

  @Field()
  totalAmount: string;

  @Field(() => [OrderItemType])
  items: OrderItemType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
