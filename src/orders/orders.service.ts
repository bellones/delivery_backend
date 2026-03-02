import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const STORE_STATUS_FLOW: OrderStatus[] = [
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
];
const DRIVER_STATUS_FLOW: OrderStatus[] = [
  OrderStatus.IN_DELIVERY,
  OrderStatus.DELIVERED,
];

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(customerId: string, dto: CreateOrderDto) {
    const store = await this.prisma.store.findFirst({
      where: { id: dto.storeId, deletedAt: null, isActive: true },
    });
    if (!store) {
      throw new BadRequestException('Loja não encontrada ou inativa');
    }
    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, userId: customerId },
    });
    if (!address) {
      throw new BadRequestException('Endereço não encontrado');
    }
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        storeId: dto.storeId,
        deletedAt: null,
        isAvailable: true,
      },
    });
    if (products.length !== productIds.length) {
      throw new BadRequestException('Um ou mais produtos não encontrados ou indisponíveis');
    }
    const productMap = new Map(products.map((p) => [p.id, p]));
    let subtotal = new Decimal(0);
    const orderItems = dto.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new BadRequestException('Produto inválido');
      const unitPrice = product.price;
      const itemTotal = unitPrice.times(item.quantity);
      subtotal = subtotal.plus(itemTotal);
      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice,
        observations: item.observations,
      };
    });
    const deliveryFee = store.deliveryFee;
    const discount = new Decimal(0);
    const total = subtotal.plus(deliveryFee).minus(discount);
    if (total.lessThan(store.minOrderValue)) {
      throw new BadRequestException(
        `Valor mínimo do pedido é ${store.minOrderValue}`,
      );
    }
    const [order] = await this.prisma.$transaction([
      this.prisma.order.create({
        data: {
          customerId,
          storeId: dto.storeId,
          addressId: dto.addressId,
          status: OrderStatus.PENDING,
          subtotal,
          deliveryFee,
          discount,
          total,
          paymentMethod: dto.paymentMethod,
          observations: dto.observations,
          items: {
            create: orderItems.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              observations: i.observations,
            })),
          },
        },
        include: {
          items: { include: { product: true } },
          address: true,
          store: { include: { category: true } },
        },
      }),
    ]);
    await this.prisma.delivery.create({
      data: { orderId: order.id, status: 'PENDING_ACCEPTANCE' },
    });
    return order;
  }

  async findAll(userId: string, role: string, storeId?: string) {
    const where: Record<string, unknown> = {};
    if (role === 'CUSTOMER') {
      where.customerId = userId;
    } else if (role === 'STORE_OWNER' || role === 'SUPER_ADMIN') {
      if (storeId) where.storeId = storeId;
      else {
        const stores = await this.prisma.store.findMany({
          where: { ownerId: userId },
          select: { id: true },
        });
        where.storeId = { in: stores.map((s) => s.id) };
      }
    } else if (role === 'DRIVER') {
      where.driverId = userId;
    }
    return this.prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
        address: true,
        store: { include: { category: true } },
        delivery: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, role: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        address: true,
        store: { include: { category: true } },
        customer: {
          select: { id: true, name: true, phone: true },
        },
        driver: {
          select: { id: true, name: true, phone: true },
        },
        delivery: true,
      },
    });
    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }
    const canAccess =
      order.customerId === userId ||
      order.driverId === userId ||
      order.store.ownerId === userId ||
      role === 'SUPER_ADMIN';
    if (!canAccess) {
      throw new ForbiddenException('Pedido não encontrado');
    }
    return order;
  }

  async updateStatus(
    id: string,
    userId: string,
    role: string,
    dto: UpdateOrderStatusDto,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { store: true, delivery: true },
    });
    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }
    if (role === 'STORE_OWNER' || role === 'SUPER_ADMIN') {
      if (order.store.ownerId !== userId && role !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Sem permissão');
      }
      if (!STORE_STATUS_FLOW.includes(dto.status)) {
        throw new BadRequestException('Status inválido para a loja');
      }
    } else if (role === 'DRIVER') {
      if (order.driverId !== userId) {
        throw new ForbiddenException('Sem permissão');
      }
      if (!DRIVER_STATUS_FLOW.includes(dto.status)) {
        throw new BadRequestException('Status inválido para o entregador');
      }
      if (dto.status === OrderStatus.IN_DELIVERY && order.delivery) {
        await this.prisma.delivery.update({
          where: { id: order.delivery.id },
          data: { status: 'IN_TRANSIT' },
        });
      }
      if (dto.status === OrderStatus.DELIVERED && order.delivery) {
        await this.prisma.delivery.update({
          where: { id: order.delivery.id },
          data: { status: 'DELIVERED', deliveredAt: new Date() },
        });
      }
    } else {
      throw new ForbiddenException('Sem permissão');
    }
    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: {
        items: { include: { product: true } },
        address: true,
        store: true,
        delivery: true,
      },
    });
  }
}
