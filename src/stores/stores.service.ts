import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Decimal } from '@prisma/client/runtime/library';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: {
    category?: string;
    search?: string;
    isActive?: boolean;
  }) {
    const where: Record<string, unknown> = { deletedAt: null };
    if (filters?.category) {
      where.categoryId = filters.category;
    }
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    return this.prisma.store.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const store = await this.prisma.store.findFirst({
      where: { slug, deletedAt: null },
      include: {
        category: true,
        products: {
          where: { deletedAt: null, isAvailable: true },
          orderBy: [{ productCategory: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
          include: { productCategory: true },
        },
        productCategories: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!store) {
      throw new NotFoundException('Loja não encontrada');
    }
    return store;
  }

  async findOne(id: string) {
    const store = await this.prisma.store.findFirst({
      where: { id, deletedAt: null },
      include: { category: true },
    });
    if (!store) {
      throw new NotFoundException('Loja não encontrada');
    }
    return store;
  }

  async create(ownerId: string, dto: CreateStoreDto) {
    const baseSlug = slugify(dto.name);
    let slug = baseSlug;
    let counter = 0;
    while (await this.prisma.store.findUnique({ where: { slug } })) {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
    const data = {
      ...dto,
      ownerId,
      slug,
      deliveryFee: dto.deliveryFee != null ? new Decimal(dto.deliveryFee) : new Decimal(0),
      minOrderValue: dto.minOrderValue != null ? new Decimal(dto.minOrderValue) : new Decimal(0),
      deliveryTimeMinutes: dto.deliveryTimeMinutes ?? 30,
      isActive: dto.isActive ?? true,
      openingHours: dto.openingHours ?? undefined,
    };
    return this.prisma.store.create({
      data: data as Parameters<PrismaService['store']['create']>[0]['data'],
      include: { category: true },
    });
  }

  async update(id: string, userId: string, dto: UpdateStoreDto) {
    await this.ensureOwnership(id, userId);
    const data: Record<string, unknown> = { ...dto };
    if (dto.deliveryFee != null) data.deliveryFee = new Decimal(dto.deliveryFee);
    if (dto.minOrderValue != null) data.minOrderValue = new Decimal(dto.minOrderValue);
    return this.prisma.store.update({
      where: { id },
      data: data as Parameters<PrismaService['store']['update']>[0]['data'],
      include: { category: true },
    });
  }

  async updateStatus(id: string, userId: string, isActive: boolean) {
    await this.ensureOwnership(id, userId);
    return this.prisma.store.update({
      where: { id },
      data: { isActive },
      include: { category: true },
    });
  }

  private async ensureOwnership(storeId: string, userId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!store || store.ownerId !== userId) {
      throw new ForbiddenException('Loja não encontrada');
    }
  }
}
