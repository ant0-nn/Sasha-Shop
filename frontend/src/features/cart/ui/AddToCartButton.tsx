'use client';

import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/entities/cart/model/cart.store';
import { AvailabilityStatus } from '@/entities/product/model/types';

interface AddToCartButtonProps {
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

export const AddToCartButton = ({ product, className }: AddToCartButtonProps) => {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <button
      type="button"
      onClick={() => addItem(product)}
      className={
        className ??
        'inline-flex items-center gap-2 rounded-lg bg-[#E31B3D] px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#c91534]'
      }
    >
      <ShoppingCart className="h-4 w-4" />
      Купити
    </button>
  );
};
