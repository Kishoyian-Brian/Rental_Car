import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, IsEnum, Min, Max } from 'class-validator';

export enum CarCategory {
  ECONOMY = 'ECONOMY',
  COMPACT = 'COMPACT',
  MID_SIZE = 'MID_SIZE',
  FULL_SIZE = 'FULL_SIZE',
  SUV = 'SUV',
  LUXURY = 'LUXURY',
  VAN = 'VAN',
  SPORTS = 'SPORTS',
}

export enum TransmissionType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
}

export enum FuelType {
  GASOLINE = 'GASOLINE',
  DIESEL = 'DIESEL',
  HYBRID = 'HYBRID',
  ELECTRIC = 'ELECTRIC',
}

export class CreateCarDto {
  @IsString()
  make: string;

  @IsString()
  model: string;

  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @IsString()
  licensePlate: string;

  @IsEnum(CarCategory)
  category: CarCategory;

  @IsEnum(TransmissionType)
  transmission: TransmissionType;

  @IsEnum(FuelType)
  fuelType: FuelType;

  @IsNumber()
  @Min(1)
  @Max(20)
  seats: number;

  @IsNumber()
  @Min(2)
  @Max(6)
  doors: number;

  @IsNumber()
  @Min(0)
  dailyRate: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @IsOptional()
  @IsBoolean()
  available?: boolean = true;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[] = [];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[] = [];

  @IsOptional()
  @IsString()
  locationId?: string;
}
