import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class PaymentsService {
    private readonly prisma;
    private readonly config;
    private readonly notifications;
    private readonly logger;
    private razorpay;
    constructor(prisma: PrismaService, config: ConfigService, notifications: NotificationsService);
    createOrder(dto: CreateOrderDto, userId: string): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        key: string | undefined;
    }>;
    verifyPayment(dto: VerifyPaymentDto, userId: string): Promise<{
        message: string;
    }>;
    handleWebhook(signature: string, rawBody: string): Promise<void>;
}
