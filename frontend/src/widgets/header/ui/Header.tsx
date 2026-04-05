'use client';

import { FormEvent } from 'react';
import { ShoppingCart, User, Search, Scale, Menu, Shield } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CatalogMenu } from '@/widgets/catalog-menu';
import { useSessionStore } from '@/entities/session/model/session.store';
import { useCartStore } from '@/entities/cart/model/cart.store';
import { useCompareStore } from '@/entities/compare/model/compare.store';

export const Header = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useSessionStore((state) => state.user);
  const cartCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const isCartHydrated = useCartStore((state) => state.isHydrated);
  const displayCartCount = isCartHydrated ? cartCount : 0;
  const compareCount = useCompareStore((state) => state.totalItems());
  const isCompareHydrated = useCompareStore((state) => state.isHydrated);
  const displayCompareCount = isCompareHydrated ? compareCount : 0;
  const initialSearchValue = pathname.startsWith('/catalog')
    ? searchParams.get('q') ?? ''
    : '';

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const normalized = String(formData.get('q') ?? '').trim();

    if (!normalized) {
      router.push('/catalog');
      return;
    }

    router.push(`/catalog?q=${encodeURIComponent(normalized)}`);
  };

  if (pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 text-foreground shadow-sm backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center focus:outline-none">
            <Image
              src="/img/SashaLogo.png"
              alt="SashaShop Logo"
              width={200}
              height={50}
              className="h-10 w-auto object-contain transition-transform hover:scale-105"
              priority
            />
          </Link>

          <div className="hidden md:block">
            <CatalogMenu />
          </div>
        </div>

        <div className="hidden flex-1 items-center justify-center px-12 md:flex">
          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full max-w-lg group"
          >
            <input
              key={`${pathname}:${initialSearchValue}`}
              name="q"
              type="text"
              defaultValue={initialSearchValue}
              placeholder="Пошук олив, фільтрів, присадок..."
              className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-12 pr-4 text-sm text-copy shadow-inner outline-none backdrop-blur-sm transition-all placeholder:text-copy-lighter focus:border-primary/50 focus:bg-white/10 focus:ring-4 focus:ring-primary/20"
            />
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-copy-lighter transition-colors group-focus-within:text-primary" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-primary px-5 py-1.5 text-xs font-bold text-primary-content shadow-[0_0_15px_rgba(58,237,234,0.3)] transition-all hover:scale-105 hover:bg-primary-light active:scale-95"
            >
              Шукати
            </button>
          </form>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-2 lg:flex">
            <Link href="/compare" className="group relative flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-copy-lighter transition-all hover:bg-white/5 hover:text-primary">
              <div className="relative">
                <Scale className="h-6 w-6 transition-transform group-hover:-translate-y-1" />
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-content shadow-sm transition-transform group-hover:scale-110">
                  {displayCompareCount}
                </span>
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wider transition-colors">Порівняння</span>
            </Link>

            <Link href={user ? '/account' : '/login'} className="group relative flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-copy-lighter transition-all hover:bg-white/5 hover:text-primary">
              <User className="h-6 w-6 transition-transform group-hover:-translate-y-1" />
              <span className="text-[10px] font-medium uppercase tracking-wider transition-colors">Кабінет</span>
            </Link>

            {user?.role === 'ADMIN' && (
              <Link href="/dashboard" className="group relative flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-copy-lighter transition-all hover:bg-white/5 hover:text-primary">
                <Shield className="h-6 w-6 transition-transform group-hover:-translate-y-1" />
                <span className="text-[10px] font-medium uppercase tracking-wider transition-colors">Адмінка</span>
              </Link>
            )}

            <Link href="/cart" className="group relative flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-copy-lighter transition-all hover:bg-white/5 hover:text-primary">
              <div className="relative">
                <ShoppingCart className="h-6 w-6 transition-transform group-hover:-translate-y-1" />
                <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-content shadow-[0_0_10px_rgba(58,237,234,0.6)] transition-transform group-hover:scale-110">
                  {displayCartCount}
                </span>
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wider transition-colors">Кошик</span>
            </Link>
          </nav>

          <button className="text-copy-lighter hover:text-primary md:hidden">
            <Menu className="h-7 w-7" />
          </button>
        </div>
      </div>

      <div className="h-[2px] w-full bg-gradient-to-r from-primary-dark via-primary-light to-secondary-light opacity-80" />
    </header>
  );
};
