import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { User, DentistProfile, LaboratoryProfile } from '../users/entities';
import { LoginDto, RegisterDto } from './dto';
import { UserRole } from '../../common/enums';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(DentistProfile)
    private dentistProfileRepository: Repository<DentistProfile>,
    @InjectRepository(LaboratoryProfile)
    private laboratoryProfileRepository: Repository<LaboratoryProfile>,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    if (dto.role === UserRole.DENTIST && !dto.dentistProfile) {
      throw new BadRequestException('Dentist profile is required');
    }
    if (dto.role === UserRole.LABORATORY && !dto.laboratoryProfile) {
      throw new BadRequestException('Laboratory profile is required');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepository.create({
      email: dto.email,
      passwordHash,
      role: dto.role,
      isVerified: true,
    });

    await this.usersRepository.save(user);

    if (dto.role === UserRole.DENTIST && dto.dentistProfile) {
      const profile = this.dentistProfileRepository.create({
        ...dto.dentistProfile,
        userId: user.id,
      });
      await this.dentistProfileRepository.save(profile);
    }

    if (dto.role === UserRole.LABORATORY && dto.laboratoryProfile) {
      const profile = this.laboratoryProfileRepository.create({
        ...dto.laboratoryProfile,
        userId: user.id,
      });
      await this.laboratoryProfileRepository.save(profile);
    }

    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    await this.usersService.updateLastLogin(user.id);

    return this.generateTokens(user);
  }

  async getProfile(userId: string) {
    return this.usersService.findById(userId);
  }

  private generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
