import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Banner } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerInput } from './dto/create-banner.input';
import { UpdateBannerInput } from './dto/update-banner.input';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(activeOnly = true): Promise<Banner[]> {
    return this.prisma.banner.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(input: CreateBannerInput): Promise<Banner> {
    const title = input.title.trim();
    const imageUrl = input.imageUrl.trim();

    if (!title) {
      throw new BadRequestException('Title is required');
    }

    if (!imageUrl) {
      throw new BadRequestException('Image URL is required');
    }

    return this.prisma.banner.create({
      data: {
        title,
        description: input.description?.trim() || null,
        imageUrl,
        linkUrl: input.linkUrl?.trim() || null,
        isActive: input.isActive ?? true,
      },
    });
  }

  async update(input: UpdateBannerInput): Promise<Banner> {
    const existing = await this.prisma.banner.findUnique({
      where: { id: input.id },
    });

    if (!existing) {
      throw new NotFoundException('Banner not found');
    }

    const data: {
      title?: string;
      description?: string | null;
      imageUrl?: string;
      linkUrl?: string | null;
      isActive?: boolean;
    } = {};

    if (input.title !== undefined) {
      const title = input.title.trim();
      if (!title) {
        throw new BadRequestException('Title cannot be empty');
      }
      data.title = title;
    }

    if (input.imageUrl !== undefined) {
      const imageUrl = input.imageUrl.trim();
      if (!imageUrl) {
        throw new BadRequestException('Image URL cannot be empty');
      }
      data.imageUrl = imageUrl;
    }

    if (input.description !== undefined) {
      data.description = input.description.trim() || null;
    }

    if (input.linkUrl !== undefined) {
      data.linkUrl = input.linkUrl.trim() || null;
    }

    if (input.isActive !== undefined) {
      data.isActive = input.isActive;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    return this.prisma.banner.update({
      where: { id: input.id },
      data,
    });
  }

  async remove(id: string): Promise<boolean> {
    const existing = await this.prisma.banner.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Banner not found');
    }

    await this.prisma.banner.delete({
      where: { id },
    });

    return true;
  }
}
