import { Module } from '@nestjs/common';
import { BannersResolver } from './banners.resolver';
import { BannersService } from './banners.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UploadBannerController } from './uploads/upload-banner.controller';

@Module({
  controllers: [UploadBannerController],
  providers: [BannersResolver, BannersService, RolesGuard],
  exports: [BannersService],
})
export class BannersModule {}
