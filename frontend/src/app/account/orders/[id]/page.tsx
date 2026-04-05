import { OrderDetailsPage } from '@/views/order/ui/OrderDetailsPage';

interface OrderDetailsRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AccountOrderDetailsRoute({
  params,
}: OrderDetailsRouteProps) {
  const { id } = await params;

  return <OrderDetailsPage id={id} />;
}
