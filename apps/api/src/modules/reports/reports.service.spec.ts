import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ReportsService', () => {
  let service: ReportsService;

  const mockApplications = [
    {
      id: 'app-1',
      admissionType: 'kcet',
      category: 'general',
      status: 'submitted',
      submittedAt: new Date('2026-01-15'),
      student: {
        firstName: 'Prajwal',
        lastName: 'Hegde',
        email: 'prajwal@example.com',
      },
    },
    {
      id: 'app-2',
      admissionType: 'comedk',
      category: 'obc',
      status: 'approved',
      submittedAt: new Date('2026-02-01'),
      student: {
        firstName: 'Ravi',
        lastName: 'Kumar',
        email: 'ravi@example.com',
      },
    },
  ];

  const mockPrisma = {
    application: {
      findMany: jest.fn().mockResolvedValue(mockApplications),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    jest.clearAllMocks();
  });

  describe('exportApplicationsToExcel', () => {
    it('should return a valid Excel buffer', async () => {
      mockPrisma.application.findMany.mockResolvedValue(mockApplications);

      const result = await service.exportApplicationsToExcel();

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(100);
      // XLSX files start with PK (zip format)
      expect(result.slice(0, 2).toString()).toBe('PK');
    });

    it('should query all applications with student data', async () => {
      mockPrisma.application.findMany.mockResolvedValue(mockApplications);

      await service.exportApplicationsToExcel();

      expect(mockPrisma.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            student: expect.objectContaining({
              select: expect.objectContaining({
                firstName: true,
                lastName: true,
                email: true,
              }),
            }),
          }),
        }),
      );
    });
  });
});
