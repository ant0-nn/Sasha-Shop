import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { BannersService } from './banners.service';
import { CreateBannerInput } from './dto/create-banner.input';
import { BannerType } from './dto/banner.type';
import { UpdateBannerInput } from './dto/update-banner.input';

@Resolver(() => BannerType)
export class BannersResolver {
  constructor(private readonly bannersService: BannersService) {}

  @Query(() => [BannerType])
  banners(
    @Args('activeOnly', { type: () => Boolean, nullable: true })
    activeOnly?: boolean,
  ): Promise<BannerType[]> {
    return this.bannersService.list(activeOnly ?? true);
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Mutation(() => BannerType)
  adminCreateBanner(
    @Args('input') input: CreateBannerInput,
  ): Promise<BannerType> {
    return this.bannersService.create(input);
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Mutation(() => BannerType)
  adminUpdateBanner(
    @Args('input') input: UpdateBannerInput,
  ): Promise<BannerType> {
    return this.bannersService.update(input);
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Mutation(() => Boolean)
  adminDeleteBanner(@Args('id') id: string): Promise<boolean> {
    return this.bannersService.remove(id);
  }
}
