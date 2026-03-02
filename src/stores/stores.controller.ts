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
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.storesService.findAll({
      category,
      search,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.storesService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STORE_OWNER', 'SUPER_ADMIN')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateStoreDto) {
    return this.storesService.create(user.sub, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STORE_OWNER', 'SUPER_ADMIN')
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateStoreDto,
  ) {
    return this.storesService.update(id, user.sub, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STORE_OWNER', 'SUPER_ADMIN')
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body('isActive') isActive: boolean,
  ) {
    return this.storesService.updateStatus(id, user.sub, isActive === true);
  }
}
