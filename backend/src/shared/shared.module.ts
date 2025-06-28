import { Module } from '@nestjs/common';
import { ApiResponseService } from './api-response.service';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { MailerService } from './mailer/mailer.service';
import { MailerController } from './mailer/mailer.controller';
import { PrismaService } from './prisma.service';

@Module({
  providers: [ApiResponseService, CloudinaryService, MailerService, PrismaService],
  controllers: [MailerController],
  exports: [ApiResponseService, CloudinaryService, MailerService, PrismaService],
})
export class SharedModule {} 