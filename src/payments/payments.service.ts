import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(orderId: string, userId: string, dto: CreatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });
    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }
    if (order.customerId !== userId) {
      throw new ForbiddenException('Sem permissão');
    }
    const hasPaid = order.payments.some((p) => p.status === PaymentStatus.PAID);
    if (hasPaid) {
      throw new BadRequestException('Pedido já pago');
    }
    return this.prisma.payment.create({
      data: {
        orderId,
        status: PaymentStatus.PENDING,
        amount: order.total,
        paymentMethod: order.paymentMethod,
        externalId: dto.externalId,
      },
    });
  }

  async findOne(paymentId: string, userId?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: { include: { store: true } } },
    });
    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }
    if (
      userId &&
      payment.order.customerId !== userId &&
      payment.order.store.ownerId !== userId
    ) {
      throw new ForbiddenException('Sem permissão');
    }
    return payment;
  }

  async findByOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true, store: true },
    });
    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }
    if (order.customerId !== userId && order.store.ownerId !== userId) {
      throw new ForbiddenException('Sem permissão');
    }
    return order.payments;
  }

  async setPaid(paymentId: string, externalId?: string) {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.PAID,
        paidAt: new Date(),
        ...(externalId && { externalId }),
      },
    });
  }
}
