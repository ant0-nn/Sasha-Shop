import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateBannerInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  imageUrl: string;

  @Field({ nullable: true })
  linkUrl?: string;

  @Field({ nullable: true, defaultValue: true })
  isActive?: boolean;
}
