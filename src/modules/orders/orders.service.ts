import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderItem, OrderStatusHistory } from './entities';
import { CreateOrderDto, UpdateOrderDto, UpdateStatusDto } from './dto';
import { OrderStatus, UserRole } from '../../common/enums';
import { User } from '../users/entities';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(OrderStatusHistory)
    private statusHistoryRepository: Repository<OrderStatusHistory>,
  ) {}

  async create(user: User, dto: CreateOrderDto): Promise<Order> {
    let dentistId: string;
    let laboratoryId: string;

    if (user.role === UserRole.LABORATORY) {
      if (!dto.dentistId) {
        throw new ForbiddenException('Laboratory must specify a dentist');
      }
      dentistId = dto.dentistId;
      laboratoryId = user.id;
    } else {
      dentistId = user.id;
      laboratoryId = dto.laboratoryId;
    }

    const order = this.ordersRepository.create({
      dentistId,
      laboratoryId,
      patientId: dto.patientId,
      patientName: dto.patientName,
      priority: dto.priority || 'normal',
      notes: dto.notes,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      status: OrderStatus.PENDING,
    });

    await this.ordersRepository.save(order);

    if (dto.items?.length) {
      const items = dto.items.map((item) =>
        this.orderItemsRepository.create({
          ...item,
          orderId: order.id,
        }),
      );
      await this.orderItemsRepository.save(items);
    }

    await this.addStatusHistory(order.id, null, OrderStatus.PENDING, user.id, 'Order created');

    return this.findOne(order.id, user);
  }

  async findAll(user: User): Promise<Order[]> {
    const where: any = {};

    if (user.role === UserRole.DENTIST) {
      where.dentistId = user.id;
    } else if (user.role === UserRole.LABORATORY) {
      where.laboratoryId = user.id;
    }

    return this.ordersRepository.find({
      where,
      relations: ['items', 'dentist', 'laboratory', 'patient'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: User): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['items', 'dentist', 'laboratory', 'patient', 'statusHistory'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (user.role !== UserRole.ADMIN && order.dentistId !== user.id && order.laboratoryId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  async update(id: string, user: User, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id, user);

    if (user.role === UserRole.DENTIST && order.dentistId !== user.id) {
      throw new ForbiddenException('Only the dentist can update order details');
    }

    if (user.role === UserRole.LABORATORY) {
      Object.assign(order, {
        internalNotes: dto.internalNotes,
        estimatedDelivery: dto.estimatedDelivery ? new Date(dto.estimatedDelivery) : order.estimatedDelivery,
      });
    } else {
      Object.assign(order, dto);
    }

    return this.ordersRepository.save(order);
  }

  async updateStatus(id: string, user: User, dto: UpdateStatusDto): Promise<Order> {
    const order = await this.findOne(id, user);
    const previousStatus = order.status;

    order.status = dto.status;

    if (dto.status === OrderStatus.SHIPPED) {
      order.shippedAt = new Date();
    }
    if (dto.status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    }

    await this.ordersRepository.save(order);
    await this.addStatusHistory(order.id, previousStatus, dto.status, user.id, dto.notes);

    return this.findOne(id, user);
  }

  async getStatusHistory(id: string, user: User): Promise<OrderStatusHistory[]> {
    await this.findOne(id, user);

    return this.statusHistoryRepository.find({
      where: { orderId: id },
      relations: ['changedByUser'],
      order: { changedAt: 'DESC' },
    });
  }

  private async addStatusHistory(
    orderId: string,
    fromStatus: OrderStatus | null,
    toStatus: OrderStatus,
    userId: string,
    notes?: string,
  ): Promise<void> {
    const history = this.statusHistoryRepository.create({
      orderId,
      fromStatus,
      toStatus,
      changedBy: userId,
      notes,
    });
    await this.statusHistoryRepository.save(history);
  }
}
