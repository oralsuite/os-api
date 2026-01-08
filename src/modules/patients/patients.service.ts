import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities';
import { CreatePatientDto, UpdatePatientDto } from './dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
  ) {}

  async create(dentistId: string, dto: CreatePatientDto): Promise<Patient> {
    const patient = this.patientsRepository.create({
      ...dto,
      dentistId,
    });
    return this.patientsRepository.save(patient);
  }

  async findAllByDentist(dentistId: string): Promise<Patient[]> {
    return this.patientsRepository.find({
      where: { dentistId, isActive: true },
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }

  async findOne(id: string, dentistId: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({ where: { id } });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    if (patient.dentistId !== dentistId) {
      throw new ForbiddenException('Access denied');
    }
    return patient;
  }

  async update(id: string, dentistId: string, dto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.findOne(id, dentistId);
    Object.assign(patient, dto);
    return this.patientsRepository.save(patient);
  }

  async remove(id: string, dentistId: string): Promise<void> {
    const patient = await this.findOne(id, dentistId);
    patient.isActive = false;
    await this.patientsRepository.save(patient);
  }
}
