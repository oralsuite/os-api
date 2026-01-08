import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto, UpdateStatusDto } from './dto';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';
import { User } from '../users/entities';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  create(@CurrentUser() user: User, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all orders for current user' })
  findAll(@CurrentUser() user: User) {
    return this.ordersService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.ordersService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order details' })
  update(@Param('id') id: string, @CurrentUser() user: User, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, user, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  updateStatus(@Param('id') id: string, @CurrentUser() user: User, @Body() dto: UpdateStatusDto) {
    return this.ordersService.updateStatus(id, user, dto);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get order status history' })
  getHistory(@Param('id') id: string, @CurrentUser() user: User) {
    return this.ordersService.getStatusHistory(id, user);
  }
}
