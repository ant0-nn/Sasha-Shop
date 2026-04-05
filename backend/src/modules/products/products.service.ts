import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AvailabilityStatus as PrismaAvailabilityStatus,
  Prisma,
  ProductType as PrismaProductType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductInput } from './dto/create-product.input';
import { ProductModel } from './dto/product.type';
import { UpdateProductInput } from './dto/update-product.input';

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    brand: true;
    viscosity: true;
    oilType: true;
  };
}>;

type ProductAttributes = {
  variantGroup?: string;
  volumeLiters?: number;
  [key: string]: unknown;
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    activeOnly = true,
    take = 20,
    search?: string,
  ): Promise<ProductModel[]> {
    const normalizedTake = Math.min(Math.max(take, 1), 100);
    const normalizedSearch = search?.trim() ?? '';
    const tokens = normalizedSearch
      .toLowerCase()
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean);

    const whereClause: Prisma.ProductWhereInput = {
      ...(activeOnly ? { isActive: true } : {}),
      ...(tokens.length
        ? {
            AND: tokens.map((token) => ({
              OR: [
                { name: { contains: token, mode: 'insensitive' } },
                { description: { contains: token, mode: 'insensitive' } },
                { sku: { contains: token, mode: 'insensitive' } },
                {
                  brand: {
                    is: { name: { contains: token, mode: 'insensitive' } },
                  },
                },
                {
                  category: {
                    is: { name: { contains: token, mode: 'insensitive' } },
                  },
                },
                {
                  viscosity: {
                    is: { name: { contains: token, mode: 'insensitive' } },
                  },
                },
                {
                  oilType: {
                    is: { name: { contains: token, mode: 'insensitive' } },
                  },
                },
              ],
            })),
          }
        : {}),
    };

    const queryTake = tokens.length ? 500 : normalizedTake;
    const products = await this.prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        brand: true,
        viscosity: true,
        oilType: true,
      },
      orderBy: [{ isPopular: 'desc' }, { createdAt: 'desc' }],
      take: queryTake,
    });

    const ranked = tokens.length
      ? products.sort((a, b) => {
          const left = this.searchScore(a, normalizedSearch, tokens);
          const right = this.searchScore(b, normalizedSearch, tokens);

          if (left !== right) {
            return right - left;
          }

          if (a.isPopular !== b.isPopular) {
            return Number(b.isPopular) - Number(a.isPopular);
          }

          return b.createdAt.getTime() - a.createdAt.getTime();
        })
      : products;

    return ranked
      .slice(0, normalizedTake)
      .map((product) => this.toProductType(product));
  }

  async create(input: CreateProductInput): Promise<ProductModel> {
    const name = input.name.trim();
    const description = input.description.trim();
    const imageUrl = input.imageUrl?.trim() || null;
    const sku = input.sku.trim();
    const categorySlug = this.toSlug(input.categorySlug);
    const categoryName = input.categoryName.trim();
    const productType = input.productType ?? PrismaProductType.OTHER;
    const availabilityStatus =
      input.availabilityStatus ?? PrismaAvailabilityStatus.IN_STOCK;
    const isActive = input.isActive ?? true;
    const isNew = input.isNew ?? false;
    const isPopular = input.isPopular ?? false;

    if (!name) {
      throw new BadRequestException('Name is required');
    }

    if (!description) {
      throw new BadRequestException('Description is required');
    }

    if (!sku) {
      throw new BadRequestException('SKU is required');
    }

    if (!categorySlug) {
      throw new BadRequestException('Category slug is required');
    }

    if (!categoryName) {
      throw new BadRequestException('Category name is required');
    }

    if (!Number.isFinite(input.price) || input.price <= 0) {
      throw new BadRequestException('Price must be greater than 0');
    }

    const slug = this.toSlug(input.slug?.trim() || name);
    if (!slug) {
      throw new BadRequestException('Slug is required');
    }

    const brandName = input.brandName?.trim();
    const viscosityName = input.viscosityName?.trim();
    const oilTypeName = input.oilTypeName?.trim();
    const variantGroup = this.normalizeVariantGroup(input.variantGroup);
    const volumeLiters =
      this.normalizeVolumeLiters(input.volumeLiters) ??
      this.extractVolumeLitersFromName(name);

    try {
      const [category, brand, viscosity, oilType] = await Promise.all([
        this.prisma.category.upsert({
          where: { slug: categorySlug },
          update: categoryName ? { name: categoryName } : {},
          create: {
            slug: categorySlug,
            name: categoryName,
          },
        }),
        brandName
          ? this.prisma.brand.upsert({
              where: { name: brandName },
              update: {},
              create: { name: brandName },
            })
          : Promise.resolve(null),
        viscosityName
          ? this.prisma.viscosity.upsert({
              where: { name: viscosityName },
              update: {},
              create: { name: viscosityName },
            })
          : Promise.resolve(null),
        oilTypeName
          ? this.prisma.oilType.upsert({
              where: { name: oilTypeName },
              update: {},
              create: { name: oilTypeName },
            })
          : Promise.resolve(null),
      ]);

      const attributesPayload: ProductAttributes = {};
      if (variantGroup) {
        attributesPayload.variantGroup = variantGroup;
      }
      if (volumeLiters !== null) {
        attributesPayload.volumeLiters = volumeLiters;
      }

      const product = await this.prisma.product.create({
        data: {
          name,
          slug,
          description,
          imageUrl,
          price: new Prisma.Decimal(input.price),
          stock: this.toStockByAvailabilityStatus(availabilityStatus),
          sku,
          productType,
          availabilityStatus,
          isNew,
          isPopular,
          categoryId: category.id,
          brandId: brand?.id ?? null,
          viscosityId: viscosity?.id ?? null,
          oilTypeId: oilType?.id ?? null,
          ...(Object.keys(attributesPayload).length
            ? { attributes: attributesPayload as Prisma.InputJsonValue }
            : {}),
          isActive,
        },
        include: {
          category: true,
          brand: true,
          viscosity: true,
          oilType: true,
        },
      });

      return this.toProductType(product);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target = Array.isArray(error.meta?.target)
          ? error.meta?.target.join(', ')
          : 'unique field';

        throw new ConflictException(
          `Product with this ${target} already exists`,
        );
      }

      throw error;
    }
  }

  async update(input: UpdateProductInput): Promise<ProductModel> {
    const existing = await this.prisma.product.findUnique({
      where: { id: input.id },
      include: {
        category: true,
        brand: true,
        viscosity: true,
        oilType: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    const data: Prisma.ProductUpdateInput = {};

    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) {
        throw new BadRequestException('Name cannot be empty');
      }
      data.name = name;
    }

    if (input.description !== undefined) {
      const description = input.description.trim();
      if (!description) {
        throw new BadRequestException('Description cannot be empty');
      }
      data.description = description;
    }

    if (input.imageUrl !== undefined) {
      data.imageUrl = input.imageUrl.trim() || null;
    }

    if (input.slug !== undefined) {
      const slug = this.toSlug(input.slug);
      if (!slug) {
        throw new BadRequestException('Slug cannot be empty');
      }
      data.slug = slug;
    }

    if (input.price !== undefined) {
      if (!Number.isFinite(input.price) || input.price <= 0) {
        throw new BadRequestException('Price must be greater than 0');
      }
      data.price = new Prisma.Decimal(input.price);
    }

    if (input.sku !== undefined) {
      const sku = input.sku.trim();
      if (!sku) {
        throw new BadRequestException('SKU cannot be empty');
      }
      data.sku = sku;
    }

    if (input.productType !== undefined) {
      data.productType = input.productType;
    }

    if (input.isActive !== undefined) {
      data.isActive = input.isActive;
    }
    if (input.isNew !== undefined) {
      data.isNew = input.isNew;
    }
    if (input.isPopular !== undefined) {
      data.isPopular = input.isPopular;
    }
    if (input.availabilityStatus !== undefined) {
      data.availabilityStatus = input.availabilityStatus;
      data.stock = this.toStockByAvailabilityStatus(input.availabilityStatus);
    }

    if (input.categorySlug !== undefined || input.categoryName !== undefined) {
      const normalizedCategorySlug = this.toSlug(
        input.categorySlug?.trim() || existing.category.slug,
      );
      const categoryName = input.categoryName?.trim() || existing.category.name;

      if (!normalizedCategorySlug) {
        throw new BadRequestException('Category slug cannot be empty');
      }

      if (!categoryName) {
        throw new BadRequestException('Category name cannot be empty');
      }

      const category = await this.prisma.category.upsert({
        where: { slug: normalizedCategorySlug },
        update: { name: categoryName },
        create: {
          slug: normalizedCategorySlug,
          name: categoryName,
        },
      });
      data.category = { connect: { id: category.id } };
    }

    if (input.brandName !== undefined) {
      const brandName = input.brandName.trim();
      if (!brandName) {
        data.brand = { disconnect: true };
      } else {
        const brand = await this.prisma.brand.upsert({
          where: { name: brandName },
          update: {},
          create: { name: brandName },
        });
        data.brand = { connect: { id: brand.id } };
      }
    }

    if (input.viscosityName !== undefined) {
      const viscosityName = input.viscosityName.trim();
      if (!viscosityName) {
        data.viscosity = { disconnect: true };
      } else {
        const viscosity = await this.prisma.viscosity.upsert({
          where: { name: viscosityName },
          update: {},
          create: { name: viscosityName },
        });
        data.viscosity = { connect: { id: viscosity.id } };
      }
    }

    if (input.oilTypeName !== undefined) {
      const oilTypeName = input.oilTypeName.trim();
      if (!oilTypeName) {
        data.oilType = { disconnect: true };
      } else {
        const oilType = await this.prisma.oilType.upsert({
          where: { name: oilTypeName },
          update: {},
          create: { name: oilTypeName },
        });
        data.oilType = { connect: { id: oilType.id } };
      }
    }

    if (input.variantGroup !== undefined) {
      const normalizedVariantGroup = this.normalizeVariantGroup(
        input.variantGroup,
      );
      const existingAttributes = this.toProductAttributes(existing.attributes);
      const nextAttributes: ProductAttributes = { ...existingAttributes };

      if (normalizedVariantGroup) {
        nextAttributes.variantGroup = normalizedVariantGroup;
      } else {
        delete nextAttributes.variantGroup;
      }

      data.attributes = nextAttributes as Prisma.InputJsonValue;
    }

    if (input.volumeLiters !== undefined) {
      const normalizedVolume = this.normalizeVolumeLiters(input.volumeLiters);
      const existingAttributes = this.toProductAttributes(existing.attributes);
      const nextAttributes: ProductAttributes = { ...existingAttributes };

      if (normalizedVolume !== null) {
        nextAttributes.volumeLiters = normalizedVolume;
      } else {
        delete nextAttributes.volumeLiters;
      }

      data.attributes = nextAttributes as Prisma.InputJsonValue;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    try {
      const updated = await this.prisma.product.update({
        where: { id: input.id },
        data,
        include: {
          category: true,
          brand: true,
          viscosity: true,
          oilType: true,
        },
      });

      return this.toProductType(updated);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target = Array.isArray(error.meta?.target)
          ? error.meta?.target.join(', ')
          : 'unique field';

        throw new ConflictException(
          `Product with this ${target} already exists`,
        );
      }

      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    const productId = id.trim();
    if (!productId) {
      throw new BadRequestException('Product id is required');
    }

    const existing = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.$transaction(async (tx) => {
      const linkedOrderItems = await tx.orderItem.findMany({
        where: { productId },
        select: { orderId: true },
      });

      const affectedOrderIds = Array.from(
        new Set(linkedOrderItems.map((item) => item.orderId)),
      );

      if (affectedOrderIds.length > 0) {
        await tx.orderItem.deleteMany({
          where: { productId },
        });

        for (const orderId of affectedOrderIds) {
          const remainingItems = await tx.orderItem.findMany({
            where: { orderId },
            select: { quantity: true, price: true },
          });

          if (!remainingItems.length) {
            await tx.order.delete({ where: { id: orderId } });
            continue;
          }

          const recalculatedTotal = remainingItems.reduce(
            (sum, item) => sum.plus(item.price.mul(item.quantity)),
            new Prisma.Decimal(0),
          );

          await tx.order.update({
            where: { id: orderId },
            data: { totalAmount: recalculatedTotal },
          });
        }
      }

      await tx.product.delete({
        where: { id: productId },
      });
    });

    return true;
  }

  private toProductType(product: ProductWithRelations): ProductModel {
    const attributes = this.toProductAttributes(product.attributes);

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      imageUrl: product.imageUrl,
      price: product.price.toString(),
      availabilityStatus: product.availabilityStatus,
      sku: product.sku,
      productType: product.productType,
      categoryId: product.categoryId,
      categoryName: product.category.name,
      categorySlug: product.category.slug,
      brandName: product.brand?.name ?? null,
      viscosityName: product.viscosity?.name ?? null,
      oilTypeName: product.oilType?.name ?? null,
      variantGroup:
        typeof attributes.variantGroup === 'string'
          ? attributes.variantGroup
          : null,
      volumeLiters:
        typeof attributes.volumeLiters === 'number' &&
        Number.isFinite(attributes.volumeLiters)
          ? attributes.volumeLiters
          : null,
      isActive: product.isActive,
      isNew: product.isNew,
      isPopular: product.isPopular,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private toSlug(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private toStockByAvailabilityStatus(
    status: PrismaAvailabilityStatus,
  ): number {
    return status === PrismaAvailabilityStatus.IN_STOCK ? 1 : 0;
  }

  private normalizeVariantGroup(value?: string | null): string | null {
    const normalized = value?.trim().toLowerCase().replace(/\s+/g, '-');
    return normalized ? normalized : null;
  }

  private normalizeVolumeLiters(value?: number | null): number | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }

    return Number(value.toFixed(2));
  }

  private extractVolumeLitersFromName(name: string): number | null {
    const match = name.match(/(\d+(?:[.,]\d+)?)\s*(?:л|l)\b/i);
    if (!match) {
      return null;
    }

    const value = Number(match[1].replace(',', '.'));
    return this.normalizeVolumeLiters(value);
  }

  private toProductAttributes(value: Prisma.JsonValue | null): ProductAttributes {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }

    return value as ProductAttributes;
  }

  private searchScore(
    product: ProductWithRelations,
    rawSearch: string,
    tokens: string[],
  ): number {
    const query = rawSearch.toLowerCase();
    const name = product.name.toLowerCase();
    const sku = product.sku.toLowerCase();
    const description = product.description.toLowerCase();
    const brand = product.brand?.name.toLowerCase() ?? '';
    const category = product.category.name.toLowerCase();
    const viscosity = product.viscosity?.name.toLowerCase() ?? '';
    const oilType = product.oilType?.name.toLowerCase() ?? '';

    let score = 0;

    if (sku === query) {
      score += 600;
    } else if (sku.startsWith(query)) {
      score += 300;
    } else if (sku.includes(query)) {
      score += 180;
    }

    if (name === query) {
      score += 500;
    } else if (name.startsWith(query)) {
      score += 260;
    } else if (name.includes(query)) {
      score += 180;
    }

    if (brand.startsWith(query)) {
      score += 140;
    } else if (brand.includes(query)) {
      score += 90;
    }

    if (category.includes(query)) {
      score += 70;
    }
    if (viscosity.includes(query)) {
      score += 60;
    }
    if (oilType.includes(query)) {
      score += 60;
    }
    if (description.includes(query)) {
      score += 30;
    }

    for (const token of tokens) {
      if (name.includes(token)) score += 30;
      if (sku.includes(token)) score += 35;
      if (brand.includes(token)) score += 20;
      if (category.includes(token)) score += 15;
      if (viscosity.includes(token)) score += 10;
      if (oilType.includes(token)) score += 10;
      if (description.includes(token)) score += 5;
    }

    if (product.isPopular) {
      score += 5;
    }

    return score;
  }
}
