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

  async findAll(status?: string, method?: string) {
    try {
      const where: any = {};
      if (status) where.status = status;
      if (method) where.method = method;

      const payments = await this.prisma.payment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
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

  async findOne(id: string, userId: string) {
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
          booking: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              car: {
                select: {
                  id: true,
                  make: true,
                  model: true,
                  year: true,
                },
              },
            },
          },
        },
      });

      if (!payment) {
        return this.apiResponse.notFound('Payment not found');
      }

      // Users can only see their own payments
      if (payment.userId !== userId) {
        return this.apiResponse.badRequest('You can only view your own payments');
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

  async findByUser(userId: string) {
    try {
      const payments = await this.prisma.payment.findMany({
        where: { userId },
        include: {
          booking: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              car: {
                select: {
                  id: true,
                  make: true,
                  model: true,
                  year: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return this.apiResponse.ok(
        payments,
        'User payments retrieved successfully',
        '',
        payments,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to retrieve user payments',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async findByBooking(bookingId: string, userId: string) {
    try {
      const payment = await this.prisma.payment.findFirst({
        where: { 
          booking: { id: bookingId },
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
          booking: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              car: {
                select: {
                  id: true,
                  make: true,
                  model: true,
                  year: true,
                },
              },
            },
          },
        },
      });

      if (!payment) {
        return this.apiResponse.notFound('Payment not found for this booking');
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

  async update(id: string, updatePaymentDto: any) {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id },
      });

      if (!payment) {
        return this.apiResponse.notFound('Payment not found');
      }

      const updatedPayment = await this.prisma.payment.update({
        where: { id },
        data: updatePaymentDto,
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
        updatedPayment,
        'Payment updated successfully',
        '',
        updatedPayment,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to update payment',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async remove(id: string) {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id },
      });

      if (!payment) {
        return this.apiResponse.notFound('Payment not found');
      }

      await this.prisma.payment.delete({
        where: { id },
      });

      return this.apiResponse.ok(
        null,
        'Payment deleted successfully',
        '',
        null,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to delete payment',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async getOverallStats() {
    try {
      const totalPayments = await this.prisma.payment.count();
      const totalAmount = await this.prisma.payment.aggregate({
        _sum: { amount: true },
      });

      const statusDistribution = await this.prisma.payment.groupBy({
        by: ['status'],
        _count: { status: true },
        _sum: { amount: true },
      });

      const methodDistribution = await this.prisma.payment.groupBy({
        by: ['method'],
        _count: { method: true },
        _sum: { amount: true },
      });

      const stats = {
        totalPayments,
        totalAmount: totalAmount._sum.amount || 0,
        statusDistribution: statusDistribution.reduce((acc, item) => {
          acc[item.status] = {
            count: item._count.status,
            amount: item._sum.amount || 0,
          };
          return acc;
        }, {}),
        methodDistribution: methodDistribution.reduce((acc, item) => {
          acc[item.method] = {
            count: item._count.method,
            amount: item._sum.amount || 0,
          };
          return acc;
        }, {}),
      };

      return this.apiResponse.ok(
        stats,
        'Payment statistics retrieved successfully',
        '',
        stats,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to retrieve payment statistics',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async getUserStats(userId: string) {
    try {
      const userPayments = await this.prisma.payment.findMany({
        where: { userId },
      });

      const totalPayments = userPayments.length;
      const totalAmount = userPayments.reduce((sum, payment) => sum + payment.amount, 0);

      const statusDistribution = userPayments.reduce((acc, payment) => {
        acc[payment.status] = (acc[payment.status] || 0) + 1;
        return acc;
      }, {});

      const methodDistribution = userPayments.reduce((acc, payment) => {
        acc[payment.method] = (acc[payment.method] || 0) + 1;
        return acc;
      }, {});

      const stats = {
        userId,
        totalPayments,
        totalAmount,
        statusDistribution,
        methodDistribution,
      };

      return this.apiResponse.ok(
        stats,
        'User payment statistics retrieved successfully',
        '',
        stats,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to retrieve user payment statistics',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async refundPayment(id: string, reason: string) {
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

      if (payment.status !== 'COMPLETED') {
        return this.apiResponse.badRequest('Only completed payments can be refunded');
      }

      const updatedPayment = await this.prisma.payment.update({
        where: { id },
        data: { 
          status: 'REFUNDED',
          transactionId: `${payment.transactionId}_REFUND_${Date.now()}`,
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
        updatedPayment,
        'Payment refunded successfully',
        '',
        updatedPayment,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to refund payment',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async getPendingApprovals() {
    try {
      const pendingPayments = await this.prisma.payment.findMany({
        where: { status: 'PENDING' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          booking: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              car: {
                select: {
                  id: true,
                  make: true,
                  model: true,
                  year: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      return this.apiResponse.ok(
        pendingPayments,
        'Pending payments retrieved successfully',
        '',
        pendingPayments,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to retrieve pending payments',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
} 