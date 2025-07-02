import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    ValidationPipe,
    Patch,
    Param,
    UseGuards,
    Get,
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { RegisterDto } from '../dto/register.dto';
  import { LoginDto } from '../dto/login.dto';
  import { ResetPasswordDto } from '../dto/reset-password.dto';
  import { CreateUserDto } from '../dto/create-user.dto';
  import { JwtAuthGuard } from './guards/jwt-auth.guard';
  import { RolesGuard } from './guards/roles.guard';
  import { Roles } from './decorators/roles.decorator';
  import { UserRole } from '../interfaces/user.interface';
  
  class RequestPasswordResetDto {
    email: string;
  }
  
  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}
  
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body(new ValidationPipe()) registerDto: RegisterDto) {
      return this.authService.register(registerDto);
    }
  
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body(new ValidationPipe()) loginDto: LoginDto) {
      return this.authService.login(loginDto);
    }
  
    @Post('request-password-reset')
    @HttpCode(HttpStatus.OK)
    async requestPasswordReset(
      @Body(new ValidationPipe()) dto: RequestPasswordResetDto,
    ) {
      return this.authService.requestPasswordReset(dto);
    }
  
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body(new ValidationPipe()) dto: ResetPasswordDto) {
      return this.authService.resetPassword(dto);
    }
  
    @Post('create-admin')
    @HttpCode(HttpStatus.CREATED)
    async createAdmin(@Body(new ValidationPipe()) adminData: CreateUserDto) {
      return this.authService.createAdmin(adminData);
    }
  
    @Patch('approve-agent/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async approveAgent(@Param('id') id: string) {
      return this.authService.approveAgent(id);
    }
  
    @Get('pending-agents')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async getPendingAgents() {
      return this.authService.getPendingAgents();
    }
  }
  