import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { OrderStatus } from '../../../common/enums';
import { User } from '../../users/entities';
import { Patient } from '../../patients/entities';
import { OrderItem } from './order-item.entity';
import { OrderStatusHistory } from './order-status-history.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_number', unique: true })
  orderNumber: string;

  @Column({ name: 'dentist_id' })
  dentistId: string;

  @Column({ name: 'laboratory_id' })
  laboratoryId: string;

  @Column({ name: 'patient_id', nullable: true })
  patientId: string;

  @Column({ type: 'enum', enum: OrderStatus, enumName: 'order_status', default: OrderStatus.DRAFT })
  status: OrderStatus;

  @Column({ name: 'patient_name', nullable: true })
  patientName: string;

  @Column({ name: 'patient_identifier', nullable: true })
  patientIdentifier: string;

  @Column({ default: 'normal' })
  priority: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date | null;

  @Column({ name: 'estimated_delivery', type: 'date', nullable: true })
  estimatedDelivery: Date;

  @Column({ name: 'shipped_at', type: 'timestamptz', nullable: true })
  shippedAt: Date;

  @Column({ name: 'delivered_at', type: 'timestamptz', nullable: true })
  deliveredAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'dentist_id' })
  dentist: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'laboratory_id' })
  laboratory: User;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => OrderStatusHistory, (history) => history.order)
  statusHistory: OrderStatusHistory[];
}
