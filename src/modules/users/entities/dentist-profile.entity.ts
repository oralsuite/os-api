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

@Entity('dentist_profiles')
export class DentistProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'license_number', nullable: true })
  licenseNumber: string;

  @Column({ nullable: true })
  specialization: string;

  @Column({ name: 'clinic_name', nullable: true })
  clinicName: string;

  @Column({ name: 'clinic_address', nullable: true })
  clinicAddress: string;

  @Column({ name: 'clinic_phone', nullable: true })
  clinicPhone: string;

  @Column({ name: 'clinic_city', nullable: true })
  clinicCity: string;

  @Column({ name: 'clinic_state', nullable: true })
  clinicState: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ name: 'notification_email', default: true })
  notificationEmail: boolean;

  @Column({ name: 'notification_push', default: true })
  notificationPush: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.dentistProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
