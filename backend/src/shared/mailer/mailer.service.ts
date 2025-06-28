/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import * as ejs from 'ejs';
import { PrismaService } from '../prisma.service';

export interface EmailOptions {
  to: string;
  subject: string;
  template?: string;
  context?: Record<string, any>;
  html?: string;
  text?: string;
}

export interface PasswordResetContext {
  name: string;
  resetUrl: string;
  resetToken: string;
  expiresIn: string;
}

export interface WelcomeEmailContext {
  name: string;
  email: string;
  frontendUrl: string;
}

export interface OrderConfirmationContext {
  name: string;
  orderNumber: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  totalAmount: number;
  shippingAddress?: string;
  trackingUrl?: string;
}

export interface BookingConfirmationContext {
  customerName: string;
  customerEmail: string;
  carMake: string;
  carModel: string;
  carYear: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  bookingId: string;
  frontendUrl: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;
  private templatesPath: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.templatesPath = path.join(process.cwd(), 'src/templates');
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpConfig = {
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: parseInt(this.configService.get<string>('SMTP_PORT', '587')),
      secure: this.configService.get<string>('SMTP_SECURE', 'false') === 'true',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    };

    this.transporter = nodemailer.createTransport(smtpConfig);
    this.logger.log('Email transporter initialized successfully');
  }

  async sendEmail(
    options: EmailOptions,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      let html = options.html;

      if (options.template && options.context) {
        html = await this.renderTemplate(options.template, options.context);
      }

      const mailOptions = {
        from: this.configService.get<string>(
          'SMTP_FROM',
          this.configService.get<string>('SMTP_USER', ''),
        ),
        to: options.to,
        subject: options.subject,
        html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Email sent successfully to ${options.to}: ${result.messageId}`,
      );

      return { success: true, messageId: result.messageId };
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${error.message}`,
      );
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetEmail(
    to: string,
    context: PasswordResetContext,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const emailOptions: EmailOptions = {
      to,
      subject: 'ShopieApp - Password Reset Request',
      template: 'password-reset',
      context: {
        ...context,
        resetUrl:
          context.resetUrl ||
          `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${context.resetToken}`,
        expiresIn: context.expiresIn || '1 hour',
      },
    };
    return this.sendEmail(emailOptions);
  }

  async sendWelcomeEmail(
    to: string,
    context: WelcomeEmailContext,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const emailOptions: EmailOptions = {
      to,
      subject: 'Welcome to Ashopie! 🎉',
      template: 'welcome',
      context: {
        ...context,
        frontendUrl: context.frontendUrl || this.configService.get<string>('FRONTEND_URL', 'http://localhost:4200'),
      },
    };
    return this.sendEmail(emailOptions);
  }

  async sendOrderConfirmationEmail(
    to: string,
    context: OrderConfirmationContext,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const emailOptions: EmailOptions = {
      to,
      subject: `ShopieApp - Order Confirmation #${context.orderNumber}`,
      template: 'order-confirmation',
      context: {
        ...context,
        orderDate: context.orderDate || new Date().toLocaleDateString(),
        trackingUrl:
          context.trackingUrl ||
          `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/orders/${context.orderNumber}`,
      },
    };
    return this.sendEmail(emailOptions);
  }

  private async renderTemplate(
    templateName: string,
    context: Record<string, any>,
  ): Promise<string> {
    try {
      const templateMap = {
        'password-reset': 'password_reset.ejs',
        'welcome': 'welcome.ejs',
        'order-confirmation': 'order_confirmation.ejs',
      };

      const filename = templateMap[templateName] || `${templateName}.ejs`;
      const templatePath = path.join(this.templatesPath, filename);

      if (!fs.existsSync(templatePath)) {
        throw new Error(
          `Template ${templateName} not found at ${templatePath}`,
        );
      }

      const templateOptions = {
        filename: templatePath,
        cache: process.env.NODE_ENV === 'production',
        compileDebug: process.env.NODE_ENV !== 'production',
      };

      const html = await ejs.renderFile(templatePath, context, templateOptions);
      return html;
    } catch (error) {
      this.logger.error(
        `Template rendering failed for ${templateName}: ${error.message}`,
      );
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: string; details?: string }> {
    try {
      await this.transporter.verify();
      return { status: 'ok' };
    } catch (error) {
      return {
        status: 'error',
        details: error.message,
      };
    }
  }

  async sendBookingConfirmation(
    booking: any,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Send confirmation to customer
      await this.sendEmail({
        to: booking.user.email,
        subject: `Booking Confirmation - ${booking.car.make} ${booking.car.model}`,
        html: `
          <h2>Booking Confirmation</h2>
          <p>Dear ${booking.user.name},</p>
          <p>Your booking has been confirmed!</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>Booking Details:</h3>
            <ul>
              <li><strong>Booking ID:</strong> ${booking.id}</li>
              <li><strong>Vehicle:</strong> ${booking.car.year} ${booking.car.make} ${booking.car.model}</li>
              <li><strong>Start Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</li>
              <li><strong>End Date:</strong> ${new Date(booking.endDate).toLocaleDateString()}</li>
              <li><strong>Total Price:</strong> $${booking.totalPrice}</li>
              <li><strong>Status:</strong> ${booking.status}</li>
            </ul>
          </div>
          <p>Thank you for choosing RentCar!</p>
        `,
      });

      // Send notification to admin and agent users
      const staffUsers = await this.prisma.user.findMany({
        where: { 
          role: { in: ['ADMIN', 'AGENT'] } 
        },
        select: { 
          email: true, 
          name: true,
          role: true 
        },
      });

      for (const staff of staffUsers) {
        await this.sendEmail({
          to: staff.email,
          subject: `New Booking - ${booking.car.make} ${booking.car.model}`,
          html: `
            <h2>New Booking Received</h2>
            <p>A new booking has been made:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3>Booking Details:</h3>
              <ul>
                <li><strong>Booking ID:</strong> ${booking.id}</li>
                <li><strong>Customer:</strong> ${booking.user.name} (${booking.user.email})</li>
                <li><strong>Vehicle:</strong> ${booking.car.year} ${booking.car.make} ${booking.car.model}</li>
                <li><strong>Start Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</li>
                <li><strong>End Date:</strong> ${new Date(booking.endDate).toLocaleDateString()}</li>
                <li><strong>Total Price:</strong> $${booking.totalPrice}</li>
                <li><strong>Status:</strong> ${booking.status}</li>
              </ul>
            </div>
            <p>You can manage this booking in the admin dashboard.</p>
          `,
        });
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendBookingCancellation(
    booking: any,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Send cancellation notification to customer
      await this.sendEmail({
        to: booking.user.email,
        subject: `Booking Cancelled - ${booking.car.make} ${booking.car.model}`,
        html: `
          <h2>Booking Cancellation</h2>
          <p>Dear ${booking.user.name},</p>
          <p>Your booking has been cancelled.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>Cancelled Booking Details:</h3>
            <ul>
              <li><strong>Booking ID:</strong> ${booking.id}</li>
              <li><strong>Vehicle:</strong> ${booking.car.year} ${booking.car.make} ${booking.car.model}</li>
              <li><strong>Start Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</li>
              <li><strong>End Date:</strong> ${new Date(booking.endDate).toLocaleDateString()}</li>
              <li><strong>Total Price:</strong> $${booking.totalPrice}</li>
            </ul>
          </div>
          <p>If you have any questions, please contact our support team.</p>
        `,
      });

      // Send notification to admin and agent users
      const staffUsers = await this.prisma.user.findMany({
        where: { 
          role: { in: ['ADMIN', 'AGENT'] } 
        },
        select: { 
          email: true, 
          name: true,
          role: true 
        },
      });

      for (const staff of staffUsers) {
        await this.sendEmail({
          to: staff.email,
          subject: `Booking Cancelled - ${booking.car.make} ${booking.car.model}`,
          html: `
            <h2>Booking Cancelled</h2>
            <p>A booking has been cancelled:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3>Cancelled Booking Details:</h3>
              <ul>
                <li><strong>Booking ID:</strong> ${booking.id}</li>
                <li><strong>Customer:</strong> ${booking.user.name} (${booking.user.email})</li>
                <li><strong>Vehicle:</strong> ${booking.car.year} ${booking.car.make} ${booking.car.model}</li>
                <li><strong>Start Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</li>
                <li><strong>End Date:</strong> ${new Date(booking.endDate).toLocaleDateString()}</li>
                <li><strong>Total Price:</strong> $${booking.totalPrice}</li>
              </ul>
            </div>
            <p>You can view this in the admin dashboard.</p>
          `,
        });
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendBookingCompletion(
    booking: any,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Send completion notification to customer
      await this.sendEmail({
        to: booking.user.email,
        subject: `Booking Completed - ${booking.car.make} ${booking.car.model}`,
        html: `
          <h2>Booking Completed</h2>
          <p>Dear ${booking.user.name},</p>
          <p>Your booking has been completed successfully!</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>Completed Booking Details:</h3>
            <ul>
              <li><strong>Booking ID:</strong> ${booking.id}</li>
              <li><strong>Vehicle:</strong> ${booking.car.year} ${booking.car.make} ${booking.car.model}</li>
              <li><strong>Start Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</li>
              <li><strong>End Date:</strong> ${new Date(booking.endDate).toLocaleDateString()}</li>
              <li><strong>Total Price:</strong> $${booking.totalPrice}</li>
            </ul>
          </div>
          <p>Thank you for choosing RentCar! We hope you had a great experience.</p>
          <p>Please consider leaving a review for the vehicle you rented.</p>
        `,
      });

      // Send notification to admin and agent users
      const staffUsers = await this.prisma.user.findMany({
        where: { 
          role: { in: ['ADMIN', 'AGENT'] } 
        },
        select: { 
          email: true, 
          name: true,
          role: true 
        },
      });

      for (const staff of staffUsers) {
        await this.sendEmail({
          to: staff.email,
          subject: `Booking Completed - ${booking.car.make} ${booking.car.model}`,
          html: `
            <h2>Booking Completed</h2>
            <p>A booking has been completed:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3>Completed Booking Details:</h3>
              <ul>
                <li><strong>Booking ID:</strong> ${booking.id}</li>
                <li><strong>Customer:</strong> ${booking.user.name} (${booking.user.email})</li>
                <li><strong>Vehicle:</strong> ${booking.car.year} ${booking.car.make} ${booking.car.model}</li>
                <li><strong>Start Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</li>
                <li><strong>End Date:</strong> ${new Date(booking.endDate).toLocaleDateString()}</li>
                <li><strong>Total Price:</strong> $${booking.totalPrice}</li>
              </ul>
            </div>
            <p>You can view this in the admin dashboard.</p>
          `,
        });
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
