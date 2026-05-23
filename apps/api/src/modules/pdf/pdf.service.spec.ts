import { Test, TestingModule } from '@nestjs/testing';
import { PdfService } from './pdf.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('PdfService', () => {
  let service: PdfService;

  const mockPrisma = {
    application: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PdfService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PdfService>(PdfService);
    jest.clearAllMocks();
  });

  describe('generateApplicationPdf', () => {
    it('should throw NotFoundException when application does not exist', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(null);

      await expect(
        service.generateApplicationPdf('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should generate a valid PDF buffer', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app-123',
        status: 'submitted',
        admissionType: 'kcet',
        category: 'general',
        submittedAt: new Date('2026-01-15'),
        formData: {
          personal: { city: 'Bengaluru', state: 'Karnataka' },
        },
        student: {
          firstName: 'Prajwal',
          lastName: 'Hegde',
          email: 'prajwal@example.com',
        },
      });

      const result = await service.generateApplicationPdf('app-123');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(100);
      // PDF files start with %PDF
      expect(result.slice(0, 5).toString()).toBe('%PDF-');
    });
  });
});
