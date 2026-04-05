import { BadRequestException, Injectable } from '@nestjs/common';
import { Currency } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateShopSettingsInput } from './dto/update-shop-settings.input';
import { ShopSettingsType } from './dto/shop-settings.type';

const SHOP_SETTINGS_SINGLETON_ID = 'global';

const DEFAULT_SETTINGS = {
  storeName: 'SashaShop',
  supportEmail: 'support@sashashop.com',
  supportPhone: '+380 (99) 111-22-33',
  managerTelegram: '@sashashop_manager',
  seoDescription: 'Магазин преміальних моторних олив та фільтрів.',
  currency: Currency.UAH,
  timezone: 'Europe/Kyiv',
  orderPrefix: 'SS',
} as const;

@Injectable()
export class ShopSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(): Promise<ShopSettingsType> {
    return this.prisma.shopSettings.upsert({
      where: { id: SHOP_SETTINGS_SINGLETON_ID },
      create: {
        id: SHOP_SETTINGS_SINGLETON_ID,
        ...DEFAULT_SETTINGS,
      },
      update: {},
    });
  }

  async updateSettings(input: UpdateShopSettingsInput): Promise<ShopSettingsType> {
    const storeName = input.storeName.trim();
    const supportEmail = input.supportEmail.trim().toLowerCase();
    const supportPhone = input.supportPhone.trim();
    const managerTelegram = input.managerTelegram.trim();
    const seoDescription = input.seoDescription.trim();
    const timezone = input.timezone.trim();
    const orderPrefix = input.orderPrefix.trim().toUpperCase();

    if (storeName.length < 2) {
      throw new BadRequestException('Store name must be at least 2 characters');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
      throw new BadRequestException('Support email is invalid');
    }

    if (supportPhone.length < 8) {
      throw new BadRequestException('Support phone must be at least 8 characters');
    }

    if (!timezone) {
      throw new BadRequestException('Timezone is required');
    }

    if (!orderPrefix || orderPrefix.length > 5) {
      throw new BadRequestException(
        'Order prefix must contain from 1 to 5 characters',
      );
    }

    if (!seoDescription) {
      throw new BadRequestException('SEO description is required');
    }

    return this.prisma.shopSettings.upsert({
      where: { id: SHOP_SETTINGS_SINGLETON_ID },
      create: {
        id: SHOP_SETTINGS_SINGLETON_ID,
        storeName,
        supportEmail,
        supportPhone,
        managerTelegram,
        seoDescription,
        currency: input.currency,
        timezone,
        orderPrefix,
      },
      update: {
        storeName,
        supportEmail,
        supportPhone,
        managerTelegram,
        seoDescription,
        currency: input.currency,
        timezone,
        orderPrefix,
      },
    });
  }

  async getOrderPrefix(): Promise<string> {
    const settings = await this.getSettings();
    return settings.orderPrefix;
  }
}
