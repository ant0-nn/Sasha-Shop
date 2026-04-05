export type Currency = 'UAH' | 'USD' | 'EUR';

export interface ShopSettings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  managerTelegram: string;
  seoDescription: string;
  currency: Currency;
  timezone: string;
  orderPrefix: string;
}
