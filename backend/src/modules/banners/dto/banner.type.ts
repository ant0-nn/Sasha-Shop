import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BannerType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field()
  imageUrl: string;

  @Field(() => String, { nullable: true })
  linkUrl?: string | null;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
