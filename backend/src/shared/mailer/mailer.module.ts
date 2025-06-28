import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MailerController } from './mailer.controller';
import { PrismaClient } from 'generated/prisma';

@Module({
  providers: [MailerService, PrismaClient],
  controllers: [MailerController],
  exports: [MailerService],
})
export class MailerModule { }
