import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../interfaces/user.interface';

interface RequestWithUser {
  user: {
    id: string;
    [key: string]: any;
  };
}

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createReviewDto: CreateReviewDto, @Req() req: RequestWithUser) {
    return this.reviewService.create(createReviewDto, req.user.id);
  }

  @Get()
  async findAll(@Query('rating') rating?: number, @Query('carId') carId?: string) {
    return this.reviewService.findAll(rating, carId);
  }

  @Get('car/:carId')
  async findByCar(@Param('carId') carId: string) {
    return this.reviewService.findByCar(carId);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async findByUser(@Param('userId') userId: string, @Req() req: RequestWithUser) {
    // Users can only see their own reviews, admins/agents can see any user's reviews
    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.AGENT && req.user.id !== userId) {
      return { success: false, message: 'Unauthorized to view other user reviews' };
    }
    return this.reviewService.findByUser(userId);
  }

  @Get('my-reviews')
  @UseGuards(JwtAuthGuard)
  async findMyReviews(@Req() req: RequestWithUser) {
    return this.reviewService.findByUser(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto, @Req() req: RequestWithUser) {
    return this.reviewService.update(id, updateReviewDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  async remove(@Param('id') id: string) {
    return this.reviewService.remove(id);
  }

  @Delete('my-review/:id')
  @UseGuards(JwtAuthGuard)
  async removeMyReview(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.reviewService.removeMyReview(id, req.user.id);
  }

  @Get('stats/overall')
  async getOverallStats() {
    return this.reviewService.getOverallStats();
  }

  @Get('stats/car/:carId')
  async getCarStats(@Param('carId') carId: string) {
    return this.reviewService.getCarStats(carId);
  }
} 