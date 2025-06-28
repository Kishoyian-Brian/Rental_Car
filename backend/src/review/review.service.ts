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

  async findAll() {
    try {
      const reviews = await this.prisma.review.findMany({
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
      // Log error but don't fail review creation
      console.error('Failed to send review notification emails:', error);
    }
  }
} 