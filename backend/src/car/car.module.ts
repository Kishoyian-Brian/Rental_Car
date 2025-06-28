import { Module } from '@nestjs/common';
import { CarController } from './car.controller';
import { CarService } from './car.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [CarController],
  providers: [CarService],
  exports: [CarService],
})
export class CarModule {}
