import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { ApiResponseService } from '../shared/api-response.service';
import { MailerService } from '../shared/mailer/mailer.service';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { UpdateBookingDto } from '../dto/update-booking.dto';
import { BookingStatus } from '../interfaces/booking.interface';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    private apiResponse: ApiResponseService,
    private mailer: MailerService,
    private notificationService: NotificationService,
  ) {}

  async create(createBookingDto: CreateBookingDto, userId: string) {
    try {
      // Check if car exists and is available
      const car = await this.prisma.car.findUnique({
        where: { id: createBookingDto.carId },
      });

      if (!car) {
        return this.apiResponse.notFound('Car not found');
      }

      if (!car.available) {
        return this.apiResponse.badRequest('Car is not available for booking');
      }

      // Check if car is already booked for the requested dates
      const conflictingBooking = await this.prisma.booking.findFirst({
        where: {
          carId: createBookingDto.carId,
          status: {
            in: ['PENDING', 'CONFIRMED', 'ACTIVE'],
          },
          OR: [
            {
              AND: [
                { startDate: { lte: createBookingDto.startDate } },
                { endDate: { gt: createBookingDto.startDate } },
              ],
            },
            {
              AND: [
                { startDate: { lt: createBookingDto.endDate } },
                { endDate: { gte: createBookingDto.endDate } },
              ],
            },
            {
              AND: [
                { startDate: { gte: createBookingDto.startDate } },
                { endDate: { lte: createBookingDto.endDate } },
              ],
            },
          ],
        },
      });

      if (conflictingBooking) {
        return this.apiResponse.badRequest('Car is already booked for the selected dates');
      }

      // Calculate total price
      const startDate = new Date(createBookingDto.startDate);
      const endDate = new Date(createBookingDto.endDate);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalPrice = daysDiff * car.dailyRate;

      const booking = await this.prisma.booking.create({
        data: {
          ...createBookingDto,
          userId,
          totalPrice,
          startDate: startDate,
          endDate: endDate,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          car: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              licensePlate: true,
              dailyRate: true,
              imageUrls: true,
            },
          },
        },
      });

      await this.mailer.sendBookingConfirmation(booking);

      return this.apiResponse.ok(booking, 'Booking created successfully', '', booking);
    } catch (error) {
      return this.apiResponse.error(
        'Failed to create booking',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async findAll(userId?: string, status?: BookingStatus) {
    try {
      const where: any = {};

      if (userId) {
        where.userId = userId;
      }

      if (status) {
        where.status = status;
      }

      const bookings = await this.prisma.booking.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          car: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              licensePlate: true,
              dailyRate: true,
              imageUrls: true,
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              status: true,
              method: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return this.apiResponse.ok(bookings, 'Bookings retrieved successfully', '', bookings);
    } catch (error) {
      return this.apiResponse.error(
        'Failed to retrieve bookings',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async findOne(id: string, userId?: string) {
    try {
      const where: any = { id };

      if (userId) {
        where.userId = userId;
      }

      const booking = await this.prisma.booking.findFirst({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          car: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              licensePlate: true,
              dailyRate: true,
              imageUrls: true,
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              status: true,
              method: true,
              transactionId: true,
            },
          },
        },
      });

      if (!booking) {
        return this.apiResponse.notFound('Booking not found');
      }

      return this.apiResponse.ok(booking, 'Booking retrieved successfully', '', booking);
    } catch (error) {
      return this.apiResponse.error(
        'Failed to retrieve booking',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async update(id: string, updateBookingDto: UpdateBookingDto, userId?: string) {
    try {
      const where: any = { id };

      if (userId) {
        where.userId = userId;
      }

      const booking = await this.prisma.booking.findFirst({
        where,
      });

      if (!booking) {
        return this.apiResponse.notFound('Booking not found');
      }

      // Check if booking can be updated (not completed or cancelled)
      if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
        return this.apiResponse.badRequest('Cannot update completed or cancelled booking');
      }

      // If dates are being updated, check for conflicts
      if (updateBookingDto.startDate || updateBookingDto.endDate) {
        const startDate = updateBookingDto.startDate ? new Date(updateBookingDto.startDate) : booking.startDate;
        const endDate = updateBookingDto.endDate ? new Date(updateBookingDto.endDate) : booking.endDate;

        const conflictingBooking = await this.prisma.booking.findFirst({
          where: {
            carId: booking.carId,
            id: { not: id },
            status: {
              in: ['PENDING', 'CONFIRMED', 'ACTIVE'],
            },
            OR: [
              {
                AND: [
                  { startDate: { lte: startDate } },
                  { endDate: { gt: startDate } },
                ],
              },
              {
                AND: [
                  { startDate: { lt: endDate } },
                  { endDate: { gte: endDate } },
                ],
              },
              {
                AND: [
                  { startDate: { gte: startDate } },
                  { endDate: { lte: endDate } },
                ],
              },
            ],
          },
        });

        if (conflictingBooking) {
          return this.apiResponse.badRequest('Car is already booked for the selected dates');
        }

        // Recalculate total price if dates changed
        if (updateBookingDto.startDate || updateBookingDto.endDate) {
          const car = await this.prisma.car.findUnique({
            where: { id: booking.carId },
          });

          if (!car) {
            return this.apiResponse.notFound('Car not found');
          }

          const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          updateBookingDto.totalPrice = daysDiff * car.dailyRate;
        }
      }

      const updatedBooking = await this.prisma.booking.update({
        where: { id },
        data: updateBookingDto,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          car: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              licensePlate: true,
              dailyRate: true,
              imageUrls: true,
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              status: true,
              method: true,
            },
          },
        },
      });

      await this.mailer.sendBookingConfirmation(updatedBooking);

      return this.apiResponse.ok(updatedBooking, 'Booking updated successfully', '', updatedBooking);
    } catch (error) {
      return this.apiResponse.error(
        'Failed to update booking',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async cancel(id: string, userId?: string) {
    try {
      const where: any = { id };

      if (userId) {
        where.userId = userId;
      }

      const booking = await this.prisma.booking.findFirst({
        where,
        include: {
          payment: true,
        },
      });

      if (!booking) {
        return this.apiResponse.notFound('Booking not found');
      }

      // Check if booking can be cancelled
      if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
        return this.apiResponse.badRequest('Booking cannot be cancelled');
      }

      // If booking is active, check if it's within cancellation window (e.g., 24 hours before start)
      if (booking.status === 'ACTIVE') {
        const now = new Date();
        const startDate = new Date(booking.startDate);
        const hoursUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursUntilStart < 24) {
          return this.apiResponse.badRequest('Cannot cancel booking within 24 hours of start time');
        }
      }

      const updatedBooking = await this.prisma.booking.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          car: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              licensePlate: true,
              dailyRate: true,
              imageUrls: true,
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              status: true,
              method: true,
            },
          },
        },
      });

      await this.mailer.sendBookingCancellation(updatedBooking);
      // Send in-app notification
      await this.notificationService.createNotification(
        updatedBooking.userId,
        `Your booking for ${updatedBooking.car.make} ${updatedBooking.car.model} has been rejected/cancelled.`,
        'BOOKING_REJECTED'
      );
      return this.apiResponse.ok(updatedBooking, 'Booking cancelled successfully', '', updatedBooking);
    } catch (error) {
      return this.apiResponse.error(
        'Failed to cancel booking',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async confirm(id: string) {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id },
      });

      if (!booking) {
        return this.apiResponse.notFound('Booking not found');
      }

      if (booking.status !== 'PENDING') {
        return this.apiResponse.badRequest('Only pending bookings can be confirmed');
      }

      const updatedBooking = await this.prisma.booking.update({
        where: { id },
        data: { status: 'CONFIRMED' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          car: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              licensePlate: true,
              dailyRate: true,
              imageUrls: true,
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              status: true,
              method: true,
            },
          },
        },
      });

      await this.mailer.sendBookingConfirmation(updatedBooking);
      // Send in-app notification
      await this.notificationService.createNotification(
        updatedBooking.userId,
        `Your booking for ${updatedBooking.car.make} ${updatedBooking.car.model} has been accepted!`,
        'BOOKING_ACCEPTED'
      );
      return this.apiResponse.ok(updatedBooking, 'Booking confirmed successfully', '', updatedBooking);
    } catch (error) {
      return this.apiResponse.error(
        'Failed to confirm booking',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async complete(id: string) {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id },
      });

      if (!booking) {
        return this.apiResponse.notFound('Booking not found');
      }

      if (booking.status !== 'ACTIVE') {
        return this.apiResponse.badRequest('Only active bookings can be completed');
      }

      const updatedBooking = await this.prisma.booking.update({
        where: { id },
        data: { status: 'COMPLETED' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          car: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              licensePlate: true,
              dailyRate: true,
              imageUrls: true,
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              status: true,
              method: true,
            },
          },
        },
      });

      await this.mailer.sendBookingCompletion(updatedBooking);

      return this.apiResponse.ok(updatedBooking, 'Booking completed successfully', '', updatedBooking);
    } catch (error) {
      return this.apiResponse.error(
        'Failed to complete booking',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async getUserBookings(userId: string, status?: BookingStatus) {
    try {
      const where: any = { userId };

      if (status) {
        where.status = status;
      }

      const bookings = await this.prisma.booking.findMany({
        where,
        include: {
          car: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              licensePlate: true,
              dailyRate: true,
              imageUrls: true,
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              status: true,
              method: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return this.apiResponse.ok(bookings, 'User bookings retrieved successfully', '', bookings);
    } catch (error) {
      return this.apiResponse.error(
        'Failed to retrieve user bookings',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
} 