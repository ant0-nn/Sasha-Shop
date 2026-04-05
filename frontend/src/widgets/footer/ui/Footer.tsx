'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Facebook, Instagram, Mail, MapPin, Phone, Send } from 'lucide-react';
import { defaultShopSettings } from '@/entities/shop-settings/model/defaults';
import { useShopSettingsQuery } from '@/features/shop-settings/model/use-shop-settings';

const footerLinks = [
  { label: 'Каталог', href: '/catalog' },
  { label: 'Популярні товари', href: '/#popular' },
  { label: 'Кошик', href: '/cart' },
  { label: 'Кабінет', href: '/account' },
  { label: 'Вхід', href: '/login' },
];

export const Footer = () => {
  const pathname = usePathname();
  const settingsQuery = useShopSettingsQuery(true);
  const settings = settingsQuery.data ?? defaultShopSettings;
  const normalizedPhoneHref = settings.supportPhone.replace(/[^\d+]/g, '');
  const telegramUsername = settings.managerTelegram.startsWith('@')
    ? settings.managerTelegram.slice(1)
    : settings.managerTelegram;

  if (pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <footer className="mt-12 border-t border-white/10 bg-primary-content text-white">
      <div className="h-[2px] w-full bg-gradient-to-r from-primary-dark via-primary-light to-secondary-light opacity-70" />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <p className="text-2xl font-black tracking-tight">{settings.storeName}</p>
          <p className="text-sm text-white/70">
            {settings.seoDescription}
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">Навігація</p>
          <ul className="space-y-2 text-sm text-white/80">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">Контакти</p>
          <ul className="space-y-3 text-sm text-white/80">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-primary" />
              <span>Київ, Україна</span>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 text-primary" />
              <a
                href={`tel:${normalizedPhoneHref}`}
                className="transition-colors hover:text-primary"
              >
                {settings.supportPhone}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 text-primary" />
              <a
                href={`mailto:${settings.supportEmail}`}
                className="transition-colors hover:text-primary"
              >
                {settings.supportEmail}
              </a>
            </li>
            {settings.managerTelegram ? (
              <li className="flex items-start gap-2">
                <Send className="mt-0.5 h-4 w-4 text-primary" />
                <a
                  href={`https://t.me/${telegramUsername}`}
                  className="transition-colors hover:text-primary"
                  target="_blank"
                  rel="noreferrer"
                >
                  {settings.managerTelegram}
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">Ми в мережі</p>
          <div className="flex items-center gap-3">
            <a
              href="#"
              aria-label="Instagram"
              className="rounded-full border border-white/20 p-2 text-white/80 transition-colors hover:border-primary hover:text-primary"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="rounded-full border border-white/20 p-2 text-white/80 transition-colors hover:border-primary hover:text-primary"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {settings.storeName}. Всі права захищено.
          </p>
          <p>Політика конфіденційності • Публічна оферта</p>
        </div>
      </div>
    </footer>
  );
};
