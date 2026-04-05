import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateProductInput } from './dto/create-product.input';
import { ProductModel } from './dto/product.type';
import { UpdateProductInput } from './dto/update-product.input';
import { ProductsService } from './products.service';

@Resolver(() => ProductModel)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Query(() => [ProductModel])
  products(
    @Args('activeOnly', { type: () => Boolean, nullable: true })
    activeOnly?: boolean,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('search', { type: () => String, nullable: true }) search?: string,
  ): Promise<ProductModel[]> {
    return this.productsService.list(activeOnly ?? true, take ?? 20, search);
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Mutation(() => ProductModel)
  adminCreateProduct(
    @Args('input') input: CreateProductInput,
  ): Promise<ProductModel> {
    return this.productsService.create(input);
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Mutation(() => ProductModel)
  adminUpdateProduct(
    @Args('input') input: UpdateProductInput,
  ): Promise<ProductModel> {
    return this.productsService.update(input);
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Mutation(() => Boolean)
  adminDeleteProduct(@Args('id', { type: () => String }) id: string): Promise<boolean> {
    return this.productsService.delete(id);
  }
}
