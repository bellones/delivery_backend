import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { DeliveryStatus, OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DeliveriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAvailable(driverId: string) {
    return this.prisma.delivery.findMany({
      where: {
        status: DeliveryStatus.PENDING_ACCEPTANCE,
        driverId: null,
        order: {
          status: { in: [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY] },
        },
      },
      include: {
        order: {
          include: {
            address: true,
            store: { include: { category: true } },
            items: { include: { product: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async accept(deliveryId: string, driverId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: true },
    });
    if (!delivery) {
      throw new NotFoundException('Entrega não encontrada');
    }
    if (delivery.status !== DeliveryStatus.PENDING_ACCEPTANCE || delivery.driverId) {
      throw new BadRequestException('Entrega não está disponível');
    }
    const [updated] = await this.prisma.$transaction([
      this.prisma.delivery.update({
        where: { id: deliveryId },
        data: {
          driverId,
          status: DeliveryStatus.ACCEPTED,
        },
        include: {
          order: {
            include: {
              address: true,
              store: true,
              items: { include: { product: true } },
            },
          },
        },
      }),
      this.prisma.order.update({
        where: { id: delivery.orderId },
        data: { driverId },
      }),
    ]);
    return updated;
  }

  async updateStatus(
    deliveryId: string,
    driverId: string,
    dto: UpdateDeliveryStatusDto,
  ) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: true },
    });
    if (!delivery || delivery.driverId !== driverId) {
      throw new ForbiddenException('Entrega não encontrada');
    }
    const data: { status: DeliveryStatus; pickupAt?: Date; deliveredAt?: Date } = {
      status: dto.status,
    };
    if (dto.status === DeliveryStatus.PICKED_UP) {
      data.pickupAt = new Date();
    }
    if (dto.status === DeliveryStatus.DELIVERED) {
      data.deliveredAt = new Date();
    }
    const tx: Promise<unknown>[] = [
      this.prisma.delivery.update({
        where: { id: deliveryId },
        data,
        include: {
          order: {
            include: {
              address: true,
              store: true,
              items: { include: { product: true } },
            },
          },
        },
      }),
    ];
    if (dto.status === DeliveryStatus.PICKED_UP) {
      tx.push(
        this.prisma.order.update({
          where: { id: delivery.orderId },
          data: { status: 'IN_DELIVERY' },
        }),
      );
    }
    if (dto.status === DeliveryStatus.DELIVERED) {
      tx.push(
        this.prisma.order.update({
          where: { id: delivery.orderId },
          data: { status: 'DELIVERED' },
        }),
      );
    }
    const [updatedDelivery] = await this.prisma.$transaction(tx);
    return updatedDelivery;
  }

  async updateLocation(driverId: string, dto: UpdateLocationDto) {
    await this.prisma.driverLocation.upsert({
      where: { driverId },
      create: {
        driverId,
        latitude: new Decimal(dto.latitude),
        longitude: new Decimal(dto.longitude),
      },
      update: {
        latitude: new Decimal(dto.latitude),
        longitude: new Decimal(dto.longitude),
      },
    });
    return { message: 'Localização atualizada' };
  }
}
