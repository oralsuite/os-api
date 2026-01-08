import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { UserRole } from '../../common/enums';
import { UpdateDentistProfileDto, UpdateLaboratoryProfileDto } from './dto/update-user.dto';
import { User } from './entities';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all users (admin only)' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('dentists')
  @ApiOperation({ summary: 'List all dentists' })
  findDentists() {
    return this.usersService.findDentists();
  }

  @Get('laboratories')
  @ApiOperation({ summary: 'List all laboratories' })
  findLaboratories() {
    return this.usersService.findLaboratories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch('profile/dentist')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DENTIST)
  @ApiOperation({ summary: 'Update dentist profile' })
  updateDentistProfile(@CurrentUser() user: User, @Body() dto: UpdateDentistProfileDto) {
    return this.usersService.updateDentistProfile(user.id, dto);
  }

  @Patch('profile/laboratory')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LABORATORY)
  @ApiOperation({ summary: 'Update laboratory profile' })
  updateLaboratoryProfile(@CurrentUser() user: User, @Body() dto: UpdateLaboratoryProfileDto) {
    return this.usersService.updateLaboratoryProfile(user.id, dto);
  }
}
