import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { UpdateBookingDto } from '../dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../interfaces/user.interface';
import { BookingStatus } from '../interfaces/booking.interface';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    id: string;
    role: UserRole;
    [key: string]: any;
  };
}

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createBookingDto: CreateBookingDto, @Req() req: RequestWithUser) {
    return this.bookingService.create(createBookingDto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  findAll(@Query('status') status?: BookingStatus) {
    return this.bookingService.findAll(undefined, status);
  }

  @Get('my-bookings')
  @UseGuards(JwtAuthGuard)
  getMyBookings(@Req() req: RequestWithUser, @Query('status') status?: BookingStatus) {
    return this.bookingService.getUserBookings(req.user.id, status);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    // Users can only view their own bookings, admins/agents can view all
    const userId = req.user.role === UserRole.CUSTOMER ? req.user.id : undefined;
    return this.bookingService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @Req() req: RequestWithUser,
  ) {
    // Users can only update their own bookings, admins/agents can update all
    const userId = req.user.role === UserRole.CUSTOMER ? req.user.id : undefined;
    return this.bookingService.update(id, updateBookingDto, userId);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancel(@Param('id') id: string, @Req() req: RequestWithUser) {
    // Users can only cancel their own bookings, admins/agents can cancel all
    const userId = req.user.role === UserRole.CUSTOMER ? req.user.id : undefined;
    return this.bookingService.cancel(id, userId);
  }

  @Patch(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  confirm(@Param('id') id: string) {
    return this.bookingService.confirm(id);
  }

  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  complete(@Param('id') id: string) {
    return this.bookingService.complete(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    // Only admins can delete bookings
    return this.bookingService.cancel(id);
  }
}
