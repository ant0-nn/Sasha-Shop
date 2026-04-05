import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ShopSettingsService } from '../shop-settings/shop-settings.service';
import { UpdateUserRoleInput } from './dto/update-user-role.input';
import { AdminStatsType } from './dto/admin-stats.type';
import { UserType } from '../auth/dto/user.type';
import { OrderType } from '../orders/dto/order.type';

type AdminOrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shopSettingsService: ShopSettingsService,
  ) {}

  async users(take = 50): Promise<UserType[]> {
    const safeTake = Math.min(Math.max(take, 1), 200);

    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: safeTake,
    });
  }

  async setUserRole(input: UpdateUserRoleInput): Promise<UserType> {
    const existing = await this.prisma.user.findUnique({
      where: { id: input.userId },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: input.userId },
      data: { role: input.role },
    });
  }

  async stats(): Promise<AdminStatsType> {
    const [usersCount, adminsCount, ordersCount, revenueAggregation] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { role: 'ADMIN' } }),
        this.prisma.order.count(),
        this.prisma.order.aggregate({
          _sum: {
            totalAmount: true,
          },
        }),
      ]);

    return {
      usersCount,
      adminsCount,
      ordersCount,
      totalRevenue: revenueAggregation._sum.totalAmount?.toString() ?? '0',
    };
  }

  async orders(take = 50, status?: OrderStatus): Promise<OrderType[]> {
    const safeTake = Math.min(Math.max(take, 1), 200);

    const orders = await this.prisma.order.findMany({
      where: status ? { status } : undefined,
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: {
            id: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: safeTake,
    });

    const orderPrefix = await this.shopSettingsService.getOrderPrefix();

    return orders.map((order) =>
      this.toOrderType(
        order,
        this.toDisplayOrderNumber(order.id, order.createdAt, orderPrefix),
      ),
    );
  }

  private toOrderType(
    order: AdminOrderWithRelations,
    displayNumber: string,
  ): OrderType {
    return {
      id: order.id,
      displayNumber,
      userId: order.userId,
      status: order.status,
      paymentMethod: order.paymentMethod,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      deliveryCity: order.deliveryCity,
      deliveryAddress: order.deliveryAddress,
      comment: order.comment,
      totalAmount: order.totalAmount.toString(),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productSlug: item.product.slug,
        productName: item.product.name,
        productImageUrl: item.product.imageUrl,
        quantity: item.quantity,
        price: item.price.toString(),
        subtotal: item.price.mul(item.quantity).toString(),
      })),
    };
  }

  private toDisplayOrderNumber(
    orderId: string,
    createdAt: Date,
    orderPrefix: string,
  ): string {
    const yy = String(createdAt.getFullYear()).slice(-2);
    const mm = String(createdAt.getMonth() + 1).padStart(2, '0');
    const dd = String(createdAt.getDate()).padStart(2, '0');
    const suffix = orderId.replace(/-/g, '').slice(-6).toUpperCase();

    return `${orderPrefix}-${yy}${mm}${dd}-${suffix}`;
  }
}
