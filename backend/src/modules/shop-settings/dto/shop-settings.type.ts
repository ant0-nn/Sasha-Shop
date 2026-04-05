import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Currency } from '@prisma/client';

registerEnumType(Currency, {
  name: 'Currency',
});

@ObjectType('ShopSettings')
export class ShopSettingsType {
  @Field()
  storeName: string;

  @Field()
  supportEmail: string;

  @Field()
  supportPhone: string;

  @Field()
  managerTelegram: string;

  @Field()
  seoDescription: string;

  @Field(() => Currency)
  currency: Currency;

  @Field()
  timezone: string;

  @Field()
  orderPrefix: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
