import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
  async findAll() {
    return this.reviewService.findAll();
  }

  @Get('car/:carId')
  async findByCar(@Param('carId') carId: string) {
    return this.reviewService.findByCar(carId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }
} 