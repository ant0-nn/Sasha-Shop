import { graphqlRequest } from '@/shared/api/graphql/client';
import { Order } from '../model/types';

interface MyOrdersResponse {
  myOrders: Order[];
}
interface MyOrderResponse {
  myOrder: Order;
}
interface CreateMyOrderResponse {
  createMyOrder: Order;
}

export interface CreateMyOrderPayload {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  customerName: string;
  customerPhone: string;
  deliveryCity: string;
  deliveryAddress: string;
  paymentMethod?: 'CASH_ON_DELIVERY' | 'CARD_ON_DELIVERY' | 'BANK_TRANSFER';
  comment?: string;
}

const MY_ORDERS_QUERY = `
  query MyOrders($take: Int) {
    myOrders(take: $take) {
      id
      displayNumber
      userId
      status
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

const MY_ORDER_QUERY = `
  query MyOrder($id: ID!) {
    myOrder(id: $id) {
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

const CREATE_MY_ORDER_MUTATION = `
  mutation CreateMyOrder($input: CreateOrderInput!) {
    createMyOrder(input: $input) {
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

export async function getMyOrders(take = 30): Promise<Order[]> {
  const data = await graphqlRequest<MyOrdersResponse, { take: number }>(
    MY_ORDERS_QUERY,
    { take },
  );

  return data.myOrders;
}

export async function getMyOrder(id: string): Promise<Order> {
  const data = await graphqlRequest<MyOrderResponse, { id: string }>(
    MY_ORDER_QUERY,
    { id },
  );

  return data.myOrder;
}

export async function createMyOrder(
  input: CreateMyOrderPayload,
): Promise<Order> {
  const data = await graphqlRequest<
    CreateMyOrderResponse,
    { input: CreateMyOrderPayload }
  >(CREATE_MY_ORDER_MUTATION, { input });

  return data.createMyOrder;
}
