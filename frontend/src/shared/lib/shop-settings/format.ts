import { defaultShopSettings } from '@/entities/shop-settings/model/defaults';
import { ShopSettings } from '@/entities/shop-settings/model/types';

type PartialShopSettings = Partial<Pick<ShopSettings, 'currency' | 'timezone' | 'orderPrefix'>>;

function normalizeSettings(settings?: PartialShopSettings) {
  return {
    currency: settings?.currency ?? defaultShopSettings.currency,
    timezone: settings?.timezone ?? defaultShopSettings.timezone,
    orderPrefix: settings?.orderPrefix ?? defaultShopSettings.orderPrefix,
  };
}

export function formatMoneyBySettings(
  value: string | number,
  settings?: PartialShopSettings,
): string {
  const numeric = Number(value);
  const safeValue = Number.isFinite(numeric) ? numeric : 0;
  const { currency } = normalizeSettings(settings);

  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(safeValue);
}

export function formatDateTimeBySettings(
  value: string | Date,
  settings?: PartialShopSettings,
): string {
  const date = value instanceof Date ? value : new Date(value);
  const { timezone } = normalizeSettings(settings);

  return new Intl.DateTimeFormat('uk-UA', {
    dateStyle: 'short',
    timeStyle: 'medium',
    timeZone: timezone,
  }).format(date);
}

export function formatDateBySettings(
  value: string | Date,
  settings?: PartialShopSettings,
): string {
  const date = value instanceof Date ? value : new Date(value);
  const { timezone } = normalizeSettings(settings);

  return new Intl.DateTimeFormat('uk-UA', {
    dateStyle: 'short',
    timeZone: timezone,
  }).format(date);
}

export function formatOrderNumberBySettings(
  orderId: string,
  createdAt: string | Date,
  settings?: PartialShopSettings,
): string {
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const { orderPrefix } = normalizeSettings(settings);
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const suffix = orderId.replace(/-/g, '').slice(-6).toUpperCase();

  return `${orderPrefix}-${yy}${mm}${dd}-${suffix}`;
}
