import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './user.service';
import { UsersController } from './users.controller';
import { SharedModule } from '../shared/shared.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    SharedModule,
  ],
  providers: [UsersService, ConfigService],
  controllers: [UsersController],
})
export class UsersModule {}
