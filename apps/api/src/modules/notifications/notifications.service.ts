import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(userId: string, type: any, title: string, body: string, metadata: any = {}) {
    return this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        metadata: JSON.stringify(metadata),
      },
    });
  }

  async getMyNotifications(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return notifications.map(n => ({
      ...n,
      metadata: n.metadata ? JSON.parse(n.metadata) : {},
    }));
  }

  async markAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }
}
