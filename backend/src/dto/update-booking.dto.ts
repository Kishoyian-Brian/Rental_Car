import { IsString, IsNumber, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { BookingStatus } from './create-booking.dto';

export class UpdateBookingDto {
  @IsOptional()
  @IsString()
  carId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  totalPrice?: number;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
