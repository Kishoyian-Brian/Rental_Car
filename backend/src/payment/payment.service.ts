import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { ApiResponseService } from '../shared/api-response.service';
import { CreatePaymentDto, PaymentStatus } from '../dto/create-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private apiResponse: ApiResponseService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, userId: string) {
    try {
      const payment = await this.prisma.payment.create({
        data: {
          ...createPaymentDto,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      return this.apiResponse.ok(
        payment,
        'Payment created successfully',
        '',
        payment,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to create payment',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async findAll() {
    try {
      const payments = await this.prisma.payment.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      return this.apiResponse.ok(
        payments,
        'Payments retrieved successfully',
        '',
        payments,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to retrieve payments',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async findOne(id: string) {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      if (!payment) {
        return this.apiResponse.notFound('Payment not found');
      }

      return this.apiResponse.ok(
        payment,
        'Payment retrieved successfully',
        '',
        payment,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to retrieve payment',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async updateStatus(id: string, status: string) {
    try {
      // Validate status
      if (!Object.values(PaymentStatus).includes(status as PaymentStatus)) {
        return this.apiResponse.badRequest('Invalid payment status');
      }
      const payment = await this.prisma.payment.update({
        where: { id },
        data: { status: status as PaymentStatus },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      return this.apiResponse.ok(
        payment,
        'Payment status updated successfully',
        '',
        payment,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to update payment status',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
} 