import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateBannerInput {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  imageUrl?: string;

  @Field(() => String, { nullable: true })
  linkUrl?: string;

  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;
}
