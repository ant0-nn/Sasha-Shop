import { Field, Float, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  AvailabilityStatus as PrismaAvailabilityStatus,
  ProductType as PrismaProductType,
} from '@prisma/client';

registerEnumType(PrismaProductType, {
  name: 'ProductType',
});
registerEnumType(PrismaAvailabilityStatus, {
  name: 'AvailabilityStatus',
});

@ObjectType('Product')
export class ProductModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field()
  description: string;

  @Field(() => String, { nullable: true })
  imageUrl?: string | null;

  @Field()
  price: string;

  @Field(() => PrismaAvailabilityStatus)
  availabilityStatus: PrismaAvailabilityStatus;

  @Field()
  sku: string;

  @Field(() => PrismaProductType)
  productType: PrismaProductType;

  @Field()
  categoryId: string;

  @Field()
  categoryName: string;

  @Field()
  categorySlug: string;

  @Field(() => String, { nullable: true })
  brandName?: string | null;

  @Field(() => String, { nullable: true })
  viscosityName?: string | null;

  @Field(() => String, { nullable: true })
  oilTypeName?: string | null;

  @Field(() => String, { nullable: true })
  variantGroup?: string | null;

  @Field(() => Float, { nullable: true })
  volumeLiters?: number | null;

  @Field()
  isActive: boolean;

  @Field()
  isNew: boolean;

  @Field()
  isPopular: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
