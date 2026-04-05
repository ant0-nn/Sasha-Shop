import { Field, Float, ID, InputType } from '@nestjs/graphql';
import {
  AvailabilityStatus as PrismaAvailabilityStatus,
  ProductType as PrismaProductType,
} from '@prisma/client';

@InputType()
export class UpdateProductInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field(() => PrismaAvailabilityStatus, { nullable: true })
  availabilityStatus?: PrismaAvailabilityStatus;

  @Field({ nullable: true })
  sku?: string;

  @Field(() => PrismaProductType, { nullable: true })
  productType?: PrismaProductType;

  @Field({ nullable: true })
  categorySlug?: string;

  @Field({ nullable: true })
  categoryName?: string;

  @Field({ nullable: true })
  brandName?: string;

  @Field({ nullable: true })
  viscosityName?: string;

  @Field({ nullable: true })
  oilTypeName?: string;

  @Field({ nullable: true })
  variantGroup?: string;

  @Field(() => Float, { nullable: true })
  volumeLiters?: number;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field({ nullable: true })
  isNew?: boolean;

  @Field({ nullable: true })
  isPopular?: boolean;
}
