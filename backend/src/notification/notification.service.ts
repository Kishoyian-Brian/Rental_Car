import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import type { Notification } from 'generated/prisma';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async createNotification(userId: string, message: string, type: string): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        userId,
        message,
        type,
      },
    });
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }
}
