import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, DentistProfile, LaboratoryProfile } from './entities';
import { UserRole } from '../../common/enums';
import { UpdateDentistProfileDto, UpdateLaboratoryProfileDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(DentistProfile)
    private dentistProfileRepository: Repository<DentistProfile>,
    @InjectRepository(LaboratoryProfile)
    private laboratoryProfileRepository: Repository<LaboratoryProfile>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['dentistProfile', 'laboratoryProfile'],
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['dentistProfile', 'laboratoryProfile'],
    });
  }

  async findDentists(): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: UserRole.DENTIST, isActive: true },
      relations: ['dentistProfile'],
    });
  }

  async findLaboratories(): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: UserRole.LABORATORY, isActive: true },
      relations: ['laboratoryProfile'],
    });
  }

  async updateDentistProfile(userId: string, dto: UpdateDentistProfileDto): Promise<DentistProfile> {
    const profile = await this.dentistProfileRepository.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Dentist profile not found');
    }
    Object.assign(profile, dto);
    return this.dentistProfileRepository.save(profile);
  }

  async updateLaboratoryProfile(userId: string, dto: UpdateLaboratoryProfileDto): Promise<LaboratoryProfile> {
    const profile = await this.laboratoryProfileRepository.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Laboratory profile not found');
    }
    Object.assign(profile, dto);
    return this.laboratoryProfileRepository.save(profile);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, { lastLoginAt: new Date() });
  }
}
