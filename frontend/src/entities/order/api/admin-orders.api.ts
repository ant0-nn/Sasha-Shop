import { graphqlRequest } from '@/shared/api/graphql/client';
import { Order, OrderStatus } from '../model/types';

interface AdminOrdersResponse {
  adminOrders: Order[];
}

const ADMIN_ORDERS_QUERY = `
  query AdminOrders($take: Int, $status: OrderStatus) {
    adminOrders(take: $take, status: $status) {
      id
      displayNumber
      userId
      status
      paymentMethod
      customerName
      customerPhone
      deliveryCity
      deliveryAddress
      comment
      totalAmount
      createdAt
      updatedAt
      items {
        id
        productId
        productSlug
        productName
        productImageUrl
        quantity
        price
        subtotal
      }
    }
  }
`;

export async function getAdminOrders(
  take = 100,
  status?: OrderStatus,
): Promise<Order[]> {
  const data = await graphqlRequest<
    AdminOrdersResponse,
    { take: number; status?: OrderStatus }
  >(ADMIN_ORDERS_QUERY, {
    take,
    status,
  });

  return data.adminOrders;
}
