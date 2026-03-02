import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.sub, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('storeId') storeId?: string,
  ) {
    return this.ordersService.findAll(user.sub, user.role, storeId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordersService.findOne(id, user.sub, user.role);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STORE_OWNER', 'DRIVER', 'SUPER_ADMIN')
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(
      id,
      user.sub,
      user.role,
      dto,
    );
  }
}
