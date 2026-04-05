'use client';

import { Scale } from 'lucide-react';
import { AvailabilityStatus } from '@/entities/product/model/types';
import { useCompareStore } from '@/entities/compare/model/compare.store';

interface ToggleCompareButtonProps {
  product: {
    id: string;
    slug: string;
    name: string;
    imageUrl?: string | null;
    price: number;
    brandName?: string | null;
    availabilityStatus: AvailabilityStatus;
  };
  className?: string;
}

export const ToggleCompareButton = ({
  product,
  className,
}: ToggleCompareButtonProps) => {
  const toggleItem = useCompareStore((state) => state.toggleItem);
  const isHydrated = useCompareStore((state) => state.isHydrated);
  const isCompared = useCompareStore((state) => state.hasItem(product.id));
  const isActive = isHydrated && isCompared;

  return (
    <button
      type="button"
      onClick={() => toggleItem(product)}
      className={
        className ??
        `inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold transition-colors ${
          isActive
            ? 'border-primary/40 bg-primary/10 text-primary-content'
            : 'border-border text-copy hover:border-primary hover:text-primary'
        }`
      }
    >
      <Scale className="h-4 w-4" />
      {isActive ? 'У порівнянні' : 'Порівняти'}
    </button>
  );
};
