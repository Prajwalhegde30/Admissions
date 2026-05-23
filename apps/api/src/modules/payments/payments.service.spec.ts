import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Mock Razorpay
jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue({
        id: 'order_test123',
        amount: 50000,
        currency: 'INR',
      }),
    },
  }));
});

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: any;
  let config: any;
  let notifications: any;

  const mockPrisma = {
    application: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockConfig = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const values: Record<string, any> = {
        RAZORPAY_KEY_ID: 'rzp_test_123',
        RAZORPAY_KEY_SECRET: 'secret_test_456',
        APPLICATION_FEE: 500,
      };
      return values[key] ?? defaultValue;
    }),
  };

  const mockNotifications = {
    createNotification: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
        { provide: NotificationsService, useValue: mockNotifications },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get(PrismaService);
    config = module.get(ConfigService);
    notifications = module.get(NotificationsService);

    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should throw NotFoundException when application does not exist', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(null);

      await expect(
        service.createOrder({ applicationId: 'non-existent' }, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user does not own the application', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app-1',
        studentId: 'user-2', // Different user
        student: { firstName: 'Test', lastName: 'User' },
      });

      await expect(
        service.createOrder({ applicationId: 'app-1' }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a Razorpay order and save payment record', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app-1',
        studentId: 'user-1',
        student: { firstName: 'Test', lastName: 'User' },
      });
      mockPrisma.payment.create.mockResolvedValue({ id: 'pay-1' });

      const result = await service.createOrder({ applicationId: 'app-1' }, 'user-1');

      expect(result).toHaveProperty('orderId', 'order_test123');
      expect(result).toHaveProperty('amount', 50000);
      expect(result).toHaveProperty('currency', 'INR');
      expect(result).toHaveProperty('key', 'rzp_test_123');
      expect(mockPrisma.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            applicationId: 'app-1',
            amount: 500,
            razorpayOrderId: 'order_test123',
            status: 'pending',
          }),
        }),
      );
    });
  });

  describe('verifyPayment', () => {
    it('should reject invalid payment signatures', async () => {
      await expect(
        service.verifyPayment(
          {
            razorpayOrderId: 'order_1',
            razorpayPaymentId: 'pay_1',
            razorpaySignature: 'invalid_signature',
          },
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
