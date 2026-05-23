import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {
    // Razorpay disabled for now — payment features will be simulated
    this.logger.warn('Razorpay disabled. Payment features will use mock mode.');
  }

  /**
   * Create a new order (mock mode — no Razorpay)
   */
  async createOrder(dto: CreateOrderDto, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: dto.applicationId },
      include: { student: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.studentId !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    const amount = parseInt(process.env.APPLICATION_FEE || '500', 10);
    const mockOrderId = `mock_order_${Date.now()}`;

    // Track payment in DB
    await this.prisma.payment.create({
      data: {
        applicationId: application.id,
        amount: amount,
        razorpayOrderId: mockOrderId,
        status: 'pending',
      },
    });

    return {
      orderId: mockOrderId,
      amount: amount * 100,
      currency: 'INR',
      key: 'mock_key',
      mockMode: true,
    };
  }

  /**
   * Verify payment (mock mode — auto-approve)
   */
  async verifyPayment(dto: VerifyPaymentDto, userId: string) {
    // Update payment record
    const payment = await this.prisma.payment.update({
      where: { razorpayOrderId: dto.razorpayOrderId },
      data: {
        status: 'captured',
        razorpayPaymentId: dto.razorpayPaymentId || `mock_pay_${Date.now()}`,
        razorpaySignature: dto.razorpaySignature || 'mock_signature',
      },
      include: { application: true },
    });

    // Update application status
    await this.prisma.application.update({
      where: { id: payment.applicationId },
      data: { status: 'paid' },
    });

    // Notify student
    await this.notifications.createNotification(
      userId,
      'payment_received',
      'Payment Successful',
      `We have received your application fee of ₹${payment.amount}. Your application is now ready for review.`,
      { applicationId: payment.applicationId, paymentId: payment.id },
    );

    return { message: 'Payment verified successfully' };
  }

  /**
   * Webhook handler (disabled in mock mode)
   */
  async handleWebhook(signature: string, rawBody: string) {
    this.logger.warn('Webhook received but Razorpay is in mock mode');
    return;
  }
}
