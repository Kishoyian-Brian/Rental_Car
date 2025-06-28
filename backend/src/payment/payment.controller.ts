import { Controller, Get, Post, Body, Param, Put, UseGuards, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser {
  user: {
    id: string;
    [key: string]: any;
  };
}

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto, @Req() req: RequestWithUser) {
    return this.paymentService.create(createPaymentDto, req.user.id);
  }

  @Get()
  async findAll() {
    return this.paymentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.paymentService.updateStatus(id, body.status);
  }
} 