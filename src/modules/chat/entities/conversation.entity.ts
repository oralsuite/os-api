import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities';
import { Order } from '../../orders/entities';
import { Message } from './message.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', nullable: true })
  orderId: string;

  @Column({ name: 'dentist_id' })
  dentistId: string;

  @Column({ name: 'laboratory_id' })
  laboratoryId: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_message_at', type: 'timestamptz', nullable: true })
  lastMessageAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'dentist_id' })
  dentist: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'laboratory_id' })
  laboratory: User;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
}
