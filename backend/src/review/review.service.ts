import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { ApiResponseService } from '../shared/api-response.service';
import { MailerService } from '../shared/mailer/mailer.service';
import { CreateReviewDto } from '../dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    private prisma: PrismaService,
    private apiResponse: ApiResponseService,
    private mailerService: MailerService,
  ) {}

  async create(createReviewDto: CreateReviewDto, userId: string) {
    try {
      const review = await this.prisma.review.create({
        data: {
          ...createReviewDto,
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
          car: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
            },
          },
        },
      });

      // Send email notifications for new review
      await this.sendReviewNotificationEmails(review);

      return this.apiResponse.ok(
        review,
        'Review created successfully',
        '',
        review,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to create review',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async findAll(rating?: number, carId?: string) {
    try {
      const where: any = {};
      if (rating) where.rating = rating;
      if (carId) where.carId = carId;

      const reviews = await this.prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          car: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return this.apiResponse.ok(
        reviews,
        'Reviews retrieved successfully',
        '',
        reviews,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to retrieve reviews',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async findByCar(carId: string) {
    try {
      const reviews = await this.prisma.review.findMany({
        where: { carId },
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
        reviews,
        'Car reviews retrieved successfully',
        '',
        reviews,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to retrieve car reviews',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async findOne(id: string) {
    try {
      const review = await this.prisma.review.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          car: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
            },
          },
        },
      });

      if (!review) {
        return this.apiResponse.notFound('Review not found');
      }

      return this.apiResponse.ok(
        review,
        'Review retrieved successfully',
        '',
        review,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to retrieve review',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private async sendReviewNotificationEmails(review: any) {
    try {
      // Find admin and agent users
      const staffUsers = await this.prisma.user.findMany({
        where: { 
          role: { in: ['ADMIN', 'AGENT'] } 
        },
        select: { 
          email: true, 
          name: true,
          role: true 
        },
      });

      // Send notification to all admin and agent users
      for (const staff of staffUsers) {
        await this.mailerService.sendEmail({
          to: staff.email,
          subject: `New Review Posted - ${review.car.make} ${review.car.model}`,
          html: `
            <h2>New Review Posted</h2>
            <p>A new review has been posted for a vehicle:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3>Vehicle Details:</h3>
              <ul>
                <li><strong>Car:</strong> ${review.car.year} ${review.car.make} ${review.car.model}</li>
                <li><strong>Rating:</strong> ${'⭐'.repeat(review.rating)} (${review.rating}/5)</li>
                <li><strong>Customer:</strong> ${review.user.name || 'Anonymous'}</li>
                <li><strong>Comment:</strong> ${review.comment || 'No comment provided'}</li>
                <li><strong>Posted:</strong> ${new Date(review.createdAt).toLocaleString()}</li>
              </ul>
            </div>
            <p>You can view this review in the admin dashboard.</p>
          `,
        });
      }
    } catch (error) {
      console.error('Failed to send review notification emails:', error);
    }
  }

  async findByUser(userId: string) {
    try {
      const reviews = await this.prisma.review.findMany({
        where: { userId },
        include: {
          car: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return this.apiResponse.ok(
        reviews,
        'User reviews retrieved successfully',
        '',
        reviews,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to retrieve user reviews',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async update(id: string, updateReviewDto: any, userId: string) {
    try {
      const review = await this.prisma.review.findUnique({
        where: { id },
      });

      if (!review) {
        return this.apiResponse.notFound('Review not found');
      }

      // Users can only update their own reviews
      if (review.userId !== userId) {
        return this.apiResponse.badRequest('You can only update your own reviews');
      }

      const updatedReview = await this.prisma.review.update({
        where: { id },
        data: updateReviewDto,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          car: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
            },
          },
        },
      });

      return this.apiResponse.ok(
        updatedReview,
        'Review updated successfully',
        '',
        updatedReview,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to update review',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async remove(id: string) {
    try {
      const review = await this.prisma.review.findUnique({
        where: { id },
      });

      if (!review) {
        return this.apiResponse.notFound('Review not found');
      }

      await this.prisma.review.delete({
        where: { id },
      });

      return this.apiResponse.ok(
        null,
        'Review deleted successfully',
        '',
        null,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to delete review',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async removeMyReview(id: string, userId: string) {
    try {
      const review = await this.prisma.review.findUnique({
        where: { id },
      });

      if (!review) {
        return this.apiResponse.notFound('Review not found');
      }

      if (review.userId !== userId) {
        return this.apiResponse.badRequest('You can only delete your own reviews');
      }

      await this.prisma.review.delete({
        where: { id },
      });

      return this.apiResponse.ok(
        null,
        'Review deleted successfully',
        '',
        null,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to delete review',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async getOverallStats() {
    try {
      const totalReviews = await this.prisma.review.count();
      const averageRating = await this.prisma.review.aggregate({
        _avg: { rating: true },
      });

      const ratingDistribution = await this.prisma.review.groupBy({
        by: ['rating'],
        _count: { rating: true },
      });

      const stats = {
        totalReviews,
        averageRating: averageRating._avg.rating || 0,
        ratingDistribution: ratingDistribution.reduce((acc, item) => {
          acc[item.rating] = item._count.rating;
          return acc;
        }, {}),
      };

      return this.apiResponse.ok(
        stats,
        'Review statistics retrieved successfully',
        '',
        stats,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to retrieve review statistics',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async getCarStats(carId: string) {
    try {
      const reviews = await this.prisma.review.findMany({
        where: { carId },
      });

      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;

      const ratingDistribution = reviews.reduce((acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      }, {});

      const stats = {
        carId,
        totalReviews,
        averageRating,
        ratingDistribution,
      };

      return this.apiResponse.ok(
        stats,
        'Car review statistics retrieved successfully',
        '',
        stats,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to retrieve car review statistics',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
} 