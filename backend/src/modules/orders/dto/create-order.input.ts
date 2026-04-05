import { Field, InputType } from '@nestjs/graphql';
import { PaymentMethod } from '@prisma/client';
import { CreateOrderItemInput } from './create-order-item.input';

@InputType('CreateOrderInput')
export class CreateOrderInput {
  @Field(() => [CreateOrderItemInput])
  items: CreateOrderItemInput[];

  @Field()
  customerName: string;

  @Field()
  customerPhone: string;

  @Field()
  deliveryCity: string;

  @Field()
  deliveryAddress: string;

  @Field(() => PaymentMethod, {
    nullable: true,
    defaultValue: PaymentMethod.CASH_ON_DELIVERY,
  })
  paymentMethod?: PaymentMethod;

  @Field({ nullable: true })
  comment?: string;
}
