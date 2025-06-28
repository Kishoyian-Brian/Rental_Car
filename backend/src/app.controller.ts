import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users/user.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    id: string;
    [key: string]: any;
  };
}

@Controller('users')
export class AppController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('get-profile')
  async getProfile(@Req() req: RequestWithUser) {
    return this.usersService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-profile')
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(req.user.id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  async softDeleteAccount(@Req() req: RequestWithUser) {
    return this.usersService.softDeleteAccount(req.user.id);
  }
}
