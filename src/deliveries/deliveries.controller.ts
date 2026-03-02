import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DeliveriesService } from './deliveries.service';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('deliveries')
@ApiBearerAuth('JWT')
@Controller('deliveries')
@UseGuards(JwtAuthGuard)
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Get('available')
  @UseGuards(RolesGuard)
  @Roles('DRIVER')
  findAvailable(@CurrentUser() user: JwtPayload) {
    return this.deliveriesService.findAvailable(user.sub);
  }

  @Patch(':id/accept')
  @UseGuards(RolesGuard)
  @Roles('DRIVER')
  accept(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.deliveriesService.accept(id, user.sub);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('DRIVER')
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateDeliveryStatusDto,
  ) {
    return this.deliveriesService.updateStatus(id, user.sub, dto);
  }

  @Patch('location')
  @UseGuards(RolesGuard)
  @Roles('DRIVER')
  updateLocation(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.deliveriesService.updateLocation(user.sub, dto);
  }
}
