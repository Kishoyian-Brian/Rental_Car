import { IsString, IsDateString, IsOptional, IsEnum } from 'class-validator';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreateBookingDto {
  @IsString()
  carId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus = BookingStatus.PENDING;
} 