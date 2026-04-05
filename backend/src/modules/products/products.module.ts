import { Module } from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ProductsResolver } from './products.resolver';
import { ProductsService } from './products.service';
import { UploadProductController } from './uploads/upload-product.controller';

@Module({
  controllers: [UploadProductController],
  providers: [ProductsResolver, ProductsService, RolesGuard],
  exports: [ProductsService],
})
export class ProductsModule {}
