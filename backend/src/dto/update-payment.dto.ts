import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { PaymentMethod, PaymentStatus } from './create-payment.dto';

export class UpdatePaymentDto {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  bookingId?: string;
} 