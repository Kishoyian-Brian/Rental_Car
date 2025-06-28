import { Controller, Get, Post, Body } from '@nestjs/common';
import { MailerService } from './mailer.service';

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Get('health')
  async healthCheck() {
    return this.mailerService.healthCheck();
  }

  @Post('test')
  async testEmail(@Body() body: { to: string; subject: string; html: string }) {
    return this.mailerService.sendEmail({
      to: body.to,
      subject: body.subject,
      html: body.html,
    });
  }
} 