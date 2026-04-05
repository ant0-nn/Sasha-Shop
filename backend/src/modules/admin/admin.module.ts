import { Module } from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ShopSettingsModule } from '../shop-settings/shop-settings.module';
import { AdminResolver } from './admin.resolver';
import { AdminService } from './admin.service';

@Module({
  imports: [ShopSettingsModule],
  providers: [AdminResolver, AdminService, RolesGuard],
})
export class AdminModule {}
