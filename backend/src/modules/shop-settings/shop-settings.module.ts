import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ShopSettingsResolver } from './shop-settings.resolver';
import { ShopSettingsService } from './shop-settings.service';

@Module({
  imports: [PrismaModule],
  providers: [ShopSettingsResolver, ShopSettingsService],
  exports: [ShopSettingsService],
})
export class ShopSettingsModule {}
