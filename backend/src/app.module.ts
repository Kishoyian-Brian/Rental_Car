import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { BookingModule } from './booking/booking.module';
import { AuthModule } from './auth/auth.module';
import { CarModule } from './car/car.module';
import { PaymentModule } from './payment/payment.module';
import { ReviewModule } from './review/review.module';
import { LocationModule } from './location/location.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule, 
    BookingModule, 
    AuthModule, 
    CarModule, 
    PaymentModule, 
    ReviewModule, 
    LocationModule,
    SharedModule,
  ],
  providers: [AppService],
})
export class AppModule {}
