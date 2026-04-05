import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('OrderItem')
export class OrderItemType {
  @Field()
  id: string;

  @Field()
  productId: string;

  @Field()
  productSlug: string;

  @Field()
  productName: string;

  @Field(() => String, { nullable: true })
  productImageUrl?: string | null;

  @Field(() => Int)
  quantity: number;

  @Field()
  price: string;

  @Field(() => String)
  subtotal: string;
}
