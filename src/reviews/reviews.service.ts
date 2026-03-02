import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(orderId: string, userId: string, dto: CreateReviewDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { reviews: true },
    });
    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }
    if (order.customerId !== userId) {
      throw new ForbiddenException('Apenas o cliente pode avaliar');
    }
    if (order.status !== 'DELIVERED') {
      throw new BadRequestException('Pedido ainda não foi entregue');
    }
    const existing = order.reviews.find((r) => r.type === dto.type);
    if (existing) {
      throw new BadRequestException('Você já avaliou este pedido para este tipo');
    }
    return this.prisma.review.create({
      data: {
        orderId,
        userId,
        storeId: order.storeId,
        rating: dto.rating,
        comment: dto.comment,
        type: dto.type,
      },
      include: { store: true },
    });
  }

  async findByStore(storeId: string) {
    return this.prisma.review.findMany({
      where: { storeId, type: 'store' },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
