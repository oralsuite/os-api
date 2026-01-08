import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderStatus } from '../../../common/enums';
import { Order } from './order.entity';
import { User } from '../../users/entities';

@Entity('order_status_history')
export class OrderStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ name: 'from_status', type: 'enum', enum: OrderStatus, enumName: 'order_status', nullable: true })
  fromStatus: OrderStatus;

  @Column({ name: 'to_status', type: 'enum', enum: OrderStatus, enumName: 'order_status' })
  toStatus: OrderStatus;

  @Column({ name: 'changed_by', nullable: true })
  changedBy: string;

  @Column({ name: 'changed_at', type: 'timestamptz', default: () => 'NOW()' })
  changedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Order, (order) => order.statusHistory)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changed_by' })
  changedByUser: User;
}
