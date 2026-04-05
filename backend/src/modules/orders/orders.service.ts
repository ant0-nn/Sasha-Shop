import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  AvailabilityStatus as PrismaAvailabilityStatus,
  PaymentMethod as PrismaPaymentMethod,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ShopSettingsService } from '../shop-settings/shop-settings.service';
import { CreateOrderInput } from './dto/create-order.input';
import { OrderType } from './dto/order.type';

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly shopSettingsService: ShopSettingsService,
  ) {}

  async createByUser(
    userId: string,
    input: CreateOrderInput,
  ): Promise<OrderType> {
    if (!input.items.length) {
      throw new BadRequestException('Order must contain at least one item');
    }
    const customerName = input.customerName?.trim();
    const customerPhone = input.customerPhone?.trim();
    const deliveryCity = input.deliveryCity?.trim();
    const deliveryAddress = input.deliveryAddress?.trim();
    const comment = input.comment?.trim() || null;
    const paymentMethod =
      input.paymentMethod ?? PrismaPaymentMethod.CASH_ON_DELIVERY;

    if (!customerName) {
      throw new BadRequestException('Customer name is required');
    }
    if (!customerPhone) {
      throw new BadRequestException('Customer phone is required');
    }
    if (!deliveryCity) {
      throw new BadRequestException('Delivery city is required');
    }
    if (!deliveryAddress) {
      throw new BadRequestException('Delivery address is required');
    }

    const normalizedByProductId = new Map<string, number>();
    for (const item of input.items) {
      const productId = item.productId.trim();
      const quantity = Math.max(1, Math.min(Math.floor(item.quantity), 99));

      if (!productId) {
        throw new BadRequestException('productId is required');
      }

      normalizedByProductId.set(
        productId,
        (normalizedByProductId.get(productId) ?? 0) + quantity,
      );
    }

    const productIds = Array.from(normalizedByProductId.keys());

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException(
        'Some products are missing or inactive and cannot be ordered',
      );
    }

    const unavailable = products.find(
      (product) =>
        product.availabilityStatus === PrismaAvailabilityStatus.OUT_OF_STOCK,
    );
    if (unavailable) {
      throw new BadRequestException(
        `Product is out of stock: ${unavailable.name}`,
      );
    }

    const totalAmount = products.reduce((sum, product) => {
      const quantity = normalizedByProductId.get(product.id) ?? 0;
      return sum.plus(product.price.mul(quantity));
    }, new Prisma.Decimal(0));

    const order = await this.prisma.order.create({
      data: {
        userId,
        paymentMethod,
        customerName,
        customerPhone,
        deliveryCity,
        deliveryAddress,
        comment,
        totalAmount,
        items: {
          create: products.map((product) => ({
            productId: product.id,
            quantity: normalizedByProductId.get(product.id) ?? 1,
            price: product.price,
          })),
        },
      },
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
    });

    const orderPrefix = await this.shopSettingsService.getOrderPrefix();
    const displayNumber = this.toDisplayOrderNumber(
      order.id,
      order.createdAt,
      orderPrefix,
    );

    this.sendTelegramOrderNotification({
      orderNumber: displayNumber,
      customerPhone: order.customerPhone,
    }).catch((error: unknown) => {
      this.logger.warn(
        `Telegram notification failed for order ${order.id}: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    });

    return this.toOrderType(order, displayNumber);
  }

  async getByIdForUser(userId: string, orderId: string): Promise<OrderType> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
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
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const orderPrefix = await this.shopSettingsService.getOrderPrefix();
    return this.toOrderType(
      order,
      this.toDisplayOrderNumber(order.id, order.createdAt, orderPrefix),
    );
  }

  async listByUser(userId: string, take = 30): Promise<OrderType[]> {
    const normalizedTake = Math.min(Math.max(take, 1), 100);

    const orders = await this.prisma.order.findMany({
      where: { userId },
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
      take: normalizedTake,
    });

    const orderPrefix = await this.shopSettingsService.getOrderPrefix();
    return orders.map((order) =>
      this.toOrderType(
        order,
        this.toDisplayOrderNumber(order.id, order.createdAt, orderPrefix),
      ),
    );
  }

  private toOrderType(order: OrderWithRelations, displayNumber: string): OrderType {
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

  private async sendTelegramOrderNotification(input: {
    orderNumber: string;
    customerPhone: string;
  }): Promise<void> {
    const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

    if (!botToken || !chatId) {
      return;
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: `Нове замовлення\nНомер замовлення: ${input.orderNumber}\nТелефон: ${input.customerPhone}`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Telegram API responded with ${response.status}`);
    }
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
