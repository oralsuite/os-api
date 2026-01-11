import { IsString, IsOptional, IsUUID, IsArray, ValidateNested, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkType, MaterialType } from '../../../common/enums';

export class CreateOrderItemDto {
  @ApiProperty({ enum: WorkType })
  @IsEnum(WorkType)
  workType: WorkType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workTypeOther?: string;

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  teethNumbers?: number[];

  @ApiPropertyOptional({ enum: MaterialType })
  @IsOptional()
  @IsEnum(MaterialType)
  material?: MaterialType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  materialOther?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shade?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  quantity?: number;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsUUID('all')
  laboratoryId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('all')
  dentistId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('all')
  patientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  patientName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
