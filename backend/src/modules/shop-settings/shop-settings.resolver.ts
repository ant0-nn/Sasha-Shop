import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UpdateShopSettingsInput } from './dto/update-shop-settings.input';
import { ShopSettingsType } from './dto/shop-settings.type';
import { ShopSettingsService } from './shop-settings.service';

@Resolver(() => ShopSettingsType)
export class ShopSettingsResolver {
  constructor(private readonly shopSettingsService: ShopSettingsService) {}

  @Query(() => ShopSettingsType)
  shopSettings(): Promise<ShopSettingsType> {
    return this.shopSettingsService.getSettings();
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Mutation(() => ShopSettingsType)
  adminUpdateShopSettings(
    @Args('input') input: UpdateShopSettingsInput,
  ): Promise<ShopSettingsType> {
    return this.shopSettingsService.updateSettings(input);
  }
}
