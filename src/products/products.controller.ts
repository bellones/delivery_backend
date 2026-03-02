import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('products')
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('stores/:storeId/products')
  findByStore(
    @Param('storeId') storeId: string,
    @Query('includeUnavailable') includeUnavailable?: string,
  ) {
    return this.productsService.findByStore(
      storeId,
      includeUnavailable === 'true',
    );
  }

  @Get('products/:id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post('stores/:storeId/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STORE_OWNER', 'SUPER_ADMIN')
  @ApiBearerAuth('JWT')
  create(
    @Param('storeId') storeId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(storeId, user.sub, dto);
  }

  @Patch('products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STORE_OWNER', 'SUPER_ADMIN')
  @ApiBearerAuth('JWT')
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, user.sub, dto);
  }

  @Delete('products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STORE_OWNER', 'SUPER_ADMIN')
  @ApiBearerAuth('JWT')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.productsService.remove(id, user.sub);
  }

  @Get('stores/:storeId/product-categories')
  getProductCategories(@Param('storeId') storeId: string) {
    return this.productsService.getProductCategories(storeId);
  }

  @Post('stores/:storeId/product-categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STORE_OWNER', 'SUPER_ADMIN')
  @ApiBearerAuth('JWT')
  createProductCategory(
    @Param('storeId') storeId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateProductCategoryDto,
  ) {
    return this.productsService.createProductCategory(storeId, user.sub, dto);
  }
}
