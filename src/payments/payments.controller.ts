import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('orders/:orderId/payment')
  create(
    @Param('orderId') orderId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.create(orderId, user.sub, dto);
  }

  @Get('payments/:id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.paymentsService.findOne(id, user.sub);
  }

  @Get('orders/:orderId/payments')
  findByOrder(
    @Param('orderId') orderId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.paymentsService.findByOrder(orderId, user.sub);
  }
}
