import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, IsEnum, Min, Max } from 'class-validator';
import { CarCategory, TransmissionType, FuelType } from './create-car.dto';

export class UpdateCarDto {
  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year?: number;

  @IsOptional()
  @IsString()
  licensePlate?: string;

  @IsOptional()
  @IsEnum(CarCategory)
  category?: CarCategory;

  @IsOptional()
  @IsEnum(TransmissionType)
  transmission?: TransmissionType;

  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  seats?: number;

  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(6)
  doors?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsString()
  locationId?: string;
}
