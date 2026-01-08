import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto, UpdatePatientDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { UserRole } from '../../common/enums';
import { User } from '../users/entities';

@ApiTags('patients')
@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DENTIST)
@ApiBearerAuth()
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new patient' })
  create(@CurrentUser() user: User, @Body() dto: CreatePatientDto) {
    return this.patientsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all patients for current dentist' })
  findAll(@CurrentUser() user: User) {
    return this.patientsService.findAllByDentist(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.patientsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update patient' })
  update(@Param('id') id: string, @CurrentUser() user: User, @Body() dto: UpdatePatientDto) {
    return this.patientsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete patient (soft delete)' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.patientsService.remove(id, user.id);
  }
}
