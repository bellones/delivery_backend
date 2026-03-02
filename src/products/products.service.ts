import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByStore(storeId: string, includeUnavailable = false) {
    const where: { storeId: string; deletedAt: null; isAvailable?: boolean } = {
      storeId,
      deletedAt: null,
    };
    if (!includeUnavailable) {
      where.isAvailable = true;
    }
    return this.prisma.product.findMany({
      where,
      include: { productCategory: true },
      orderBy: [{ productCategory: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { store: true, productCategory: true },
    });
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }
    return product;
  }

  async create(storeId: string, userId: string, dto: CreateProductDto) {
    await this.ensureStoreOwnership(storeId, userId);
    const data = {
      ...dto,
      storeId,
      price: new Decimal(dto.price),
      isAvailable: dto.isAvailable ?? true,
      sortOrder: dto.sortOrder ?? 0,
    };
    return this.prisma.product.create({
      data: data as Parameters<PrismaService['product']['create']>[0]['data'],
      include: { productCategory: true },
    });
  }

  async update(id: string, userId: string, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    await this.ensureStoreOwnership(product.storeId, userId);
    const data: Record<string, unknown> = { ...dto };
    if (dto.price != null) data.price = new Decimal(dto.price);
    return this.prisma.product.update({
      where: { id },
      data: data as Parameters<PrismaService['product']['update']>[0]['data'],
      include: { productCategory: true },
    });
  }

  async remove(id: string, userId: string) {
    const product = await this.findOne(id);
    await this.ensureStoreOwnership(product.storeId, userId);
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { message: 'Produto removido' };
  }

  async getProductCategories(storeId: string) {
    return this.prisma.productCategory.findMany({
      where: { storeId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createProductCategory(
    storeId: string,
    userId: string,
    dto: CreateProductCategoryDto,
  ) {
    await this.ensureStoreOwnership(storeId, userId);
    return this.prisma.productCategory.create({
      data: {
        storeId,
        name: dto.name,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  private async ensureStoreOwnership(storeId: string, userId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!store || store.ownerId !== userId) {
      throw new ForbiddenException('Loja não encontrada');
    }
  }
}
