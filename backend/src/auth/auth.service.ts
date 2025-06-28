import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../shared/prisma.service';
import { MailerService } from '../shared/mailer/mailer.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // Create user with CUSTOMER role by default
      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          name: registerDto.name,
          phone: registerDto.phone,
          role: 'CUSTOMER',
          status: 'ACTIVE',
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      // Generate JWT token
      const token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      // Send welcome email to customer
      await this.sendWelcomeEmailToCustomer(user);

      // Send notification email to admin
      await this.sendNewCustomerNotificationToAdmin(user);

      return {
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          accessToken: token,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    try {
      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
      });

      if (!user) {
        throw new BadRequestException('Invalid credentials');
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid credentials');
      }

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      // Generate JWT token
      const token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        success: true,
        message: 'User logged in successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          accessToken: token,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async createAdmin(adminData: CreateUserDto) {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: adminData.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(adminData.password, 10);

      // Create admin user
      const admin = await this.prisma.user.create({
        data: {
          email: adminData.email,
          password: hashedPassword,
          name: adminData.name,
          phone: adminData.phone,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      return {
        success: true,
        message: 'Admin created successfully',
        data: admin,
      };
    } catch (error) {
      throw error;
    }
  }

  async createAgent(agentData: CreateUserDto) {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: agentData.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(agentData.password, 10);

      // Create agent user
      const agent = await this.prisma.user.create({
        data: {
          email: agentData.email,
          password: hashedPassword,
          name: agentData.name,
          phone: agentData.phone,
          role: 'AGENT',
          status: 'ACTIVE',
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      return {
        success: true,
        message: 'Agent created successfully',
        data: agent,
      };
    } catch (error) {
      throw error;
    }
  }

  async requestPasswordReset(dto: { email: string }) {
    // TODO: Implement password reset request logic
    return { message: 'Password reset email sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          resetToken: dto.token,
          resetTokenExpiry: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

      // Update user password and clear reset token
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return {
        success: true,
        message: 'Password reset successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  private async sendWelcomeEmailToCustomer(user: any) {
    try {
      await this.mailerService.sendWelcomeEmail(user.email, {
        name: user.name || 'Customer',
        email: user.email,
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
      });
    } catch (error) {
      // Log error but don't fail registration
      console.error('Failed to send welcome email:', error);
    }
  }

  private async sendNewCustomerNotificationToAdmin(customer: any) {
    try {
      // Find admin users
      const admins = await this.prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { email: true, name: true },
      });

      // Send notification to all admins
      for (const admin of admins) {
        await this.mailerService.sendEmail({
          to: admin.email,
          subject: 'New Customer Registration - RentCar',
          html: `
            <h2>New Customer Registration</h2>
            <p>A new customer has registered on RentCar:</p>
            <ul>
              <li><strong>Name:</strong> ${customer.name || 'Not provided'}</li>
              <li><strong>Email:</strong> ${customer.email}</li>
              <li><strong>Registration Date:</strong> ${new Date(customer.createdAt).toLocaleString()}</li>
            </ul>
            <p>You can view customer details in the admin dashboard.</p>
          `,
        });
      }
    } catch (error) {
      // Log error but don't fail registration
      console.error('Failed to send admin notification:', error);
    }
  }
}
