import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WorkType, MaterialType } from '../../../common/enums';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ name: 'work_type', type: 'enum', enum: WorkType, enumName: 'work_type' })
  workType: WorkType;

  @Column({ name: 'work_type_other', nullable: true })
  workTypeOther: string;

  @Column({ name: 'teeth_numbers', type: 'int', array: true, nullable: true })
  teethNumbers: number[];

  @Column({ type: 'enum', enum: MaterialType, enumName: 'material_type', nullable: true })
  material: MaterialType;

  @Column({ name: 'material_other', nullable: true })
  materialOther: string;

  @Column({ nullable: true })
  shade: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 1 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitPrice: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
