import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { SharedModule } from '../shared/shared.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [SharedModule, NotificationModule],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
