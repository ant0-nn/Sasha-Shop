import { Field, Float, InputType } from '@nestjs/graphql';
import {
  AvailabilityStatus as PrismaAvailabilityStatus,
  ProductType as PrismaProductType,
} from '@prisma/client';

@InputType()
export class CreateProductInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  slug?: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => Float)
  price: number;

  @Field(() => PrismaAvailabilityStatus, {
    nullable: true,
    defaultValue: PrismaAvailabilityStatus.IN_STOCK,
  })
  availabilityStatus?: PrismaAvailabilityStatus;

  @Field()
  sku: string;

  @Field(() => PrismaProductType, {
    nullable: true,
    defaultValue: PrismaProductType.OTHER,
  })
  productType?: PrismaProductType;

  @Field()
  categorySlug: string;

  @Field()
  categoryName: string;

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

  @Field({ nullable: true, defaultValue: true })
  isActive?: boolean;

  @Field({ nullable: true, defaultValue: false })
  isNew?: boolean;

  @Field({ nullable: true, defaultValue: false })
  isPopular?: boolean;
}
