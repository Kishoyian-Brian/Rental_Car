import { User, Car, Payment } from "generated/prisma";
import { BookingStatus as PrismaBookingStatus } from 'generated/prisma';

export type BookingStatus = PrismaBookingStatus;

export interface Booking {
  id: string;
  userId: string;
  carId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: BookingStatus;
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingWithRelations extends Booking {
  user?: User;
  car?: Car;
  payment?: Payment;
}

export interface BookingFilters {
  userId?: string;
  carId?: string;
  status?: BookingStatus;
  startDate?: Date;
  endDate?: Date;
  minTotalPrice?: number;
  maxTotalPrice?: number;
}
