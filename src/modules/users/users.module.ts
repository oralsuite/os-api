import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, DentistProfile, LaboratoryProfile } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, DentistProfile, LaboratoryProfile])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
