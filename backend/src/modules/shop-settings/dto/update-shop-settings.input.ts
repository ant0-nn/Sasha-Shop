import { Field, InputType } from '@nestjs/graphql';
import { Currency } from '@prisma/client';

@InputType()
export class UpdateShopSettingsInput {
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
}
