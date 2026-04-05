export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod =
  | 'CASH_ON_DELIVERY'
  | 'CARD_ON_DELIVERY'
  | 'BANK_TRANSFER';

export interface OrderItem {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  productImageUrl?: string | null;
  quantity: number;
  price: string;
  subtotal: string;
}

export interface Order {
  id: string;
  displayNumber: string;
  userId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerPhone: string;
  deliveryCity: string;
  deliveryAddress: string;
  comment?: string | null;
  totalAmount: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}
