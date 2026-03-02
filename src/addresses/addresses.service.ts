import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async create(userId: string, dto: CreateAddressDto) {
    const data = {
      ...dto,
      userId,
      latitude: dto.latitude != null ? new Decimal(dto.latitude) : undefined,
      longitude: dto.longitude != null ? new Decimal(dto.longitude) : undefined,
    };
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.create({ data });
  }

  async update(id: string, userId: string, dto: UpdateAddressDto) {
    await this.ensureOwnership(id, userId);
    const data: Record<string, unknown> = { ...dto };
    if (dto.latitude != null) data.latitude = new Decimal(dto.latitude);
    if (dto.longitude != null) data.longitude = new Decimal(dto.longitude);
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.update({
      where: { id },
      data: data as Parameters<PrismaService['address']['update']>[0]['data'],
    });
  }

  async remove(id: string, userId: string) {
    await this.ensureOwnership(id, userId);
    return this.prisma.address.delete({ where: { id } });
  }

  private async ensureOwnership(addressId: string, userId: string) {
    const addr = await this.prisma.address.findUnique({
      where: { id: addressId },
    });
    if (!addr || addr.userId !== userId) {
      throw new ForbiddenException('Endereço não encontrado');
    }
  }
}
