import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
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

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createPaymentDto: CreatePaymentDto, @Req() req: RequestWithUser) {
    return this.paymentService.create(createPaymentDto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  async findAll(@Query('status') status?: string, @Query('method') method?: string) {
    return this.paymentService.findAll(status, method);
  }

  @Get('my-payments')
  @UseGuards(JwtAuthGuard)
  async findMyPayments(@Req() req: RequestWithUser) {
    return this.paymentService.findByUser(req.user.id);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  async findByUser(@Param('userId') userId: string) {
    return this.paymentService.findByUser(userId);
  }

  @Get('booking/:bookingId')
  @UseGuards(JwtAuthGuard)
  async findByBooking(@Param('bookingId') bookingId: string, @Req() req: RequestWithUser) {
    return this.paymentService.findByBooking(bookingId, req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.paymentService.findOne(id, req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  async update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(id, updatePaymentDto);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.paymentService.updateStatus(id, body.status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.paymentService.remove(id);
  }

  @Get('stats/overall')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  async getOverallStats() {
    return this.paymentService.getOverallStats();
  }

  @Get('stats/user/:userId')
  @UseGuards(JwtAuthGuard)
  async getUserStats(@Param('userId') userId: string, @Req() req: RequestWithUser) {
    // Users can only see their own stats, admins/agents can see any user's stats
    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.AGENT && req.user.id !== userId) {
      return { success: false, message: 'Unauthorized to view other user payment stats' };
    }
    return this.paymentService.getUserStats(userId);
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  async refundPayment(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.paymentService.refundPayment(id, body.reason);
  }

  @Get('pending/approval')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  async getPendingApprovals() {
    return this.paymentService.getPendingApprovals();
  }
} 