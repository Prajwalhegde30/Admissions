import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async exportApplicationsToExcel() {
    const applications = await this.prisma.application.findMany({
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Applications');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 40 },
      { header: 'Student Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Admission Type', key: 'admissionType', width: 20 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Submitted At', key: 'submittedAt', width: 25 },
    ];

    applications.forEach((app) => {
      worksheet.addRow({
        id: app.id,
        name: `${app.student.firstName} ${app.student.lastName}`,
        email: app.student.email,
        admissionType: app.admissionType,
        category: app.category,
        status: app.status,
        submittedAt: app.submittedAt ? app.submittedAt.toISOString() : 'N/A',
      });
    });

    // Formatting
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
