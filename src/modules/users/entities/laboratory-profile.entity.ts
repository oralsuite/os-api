import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('laboratory_profiles')
export class LaboratoryProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'business_name' })
  businessName: string;

  @Column({ name: 'tax_id', nullable: true })
  taxId: string;

  @Column({ name: 'contact_name', nullable: true })
  contactName: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ name: 'postal_code', nullable: true })
  postalCode: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @Column({ name: 'work_types_offered', type: 'text', array: true, default: '{}' })
  workTypesOffered: string[];

  @Column({ name: 'materials_offered', type: 'text', array: true, default: '{}' })
  materialsOffered: string[];

  @Column({ name: 'average_turnaround_days', default: 7 })
  averageTurnaroundDays: number;

  @Column({ name: 'accepts_new_clients', default: true })
  acceptsNewClients: boolean;

  @Column({ name: 'notification_email', default: true })
  notificationEmail: boolean;

  @Column({ name: 'notification_push', default: true })
  notificationPush: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.laboratoryProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
