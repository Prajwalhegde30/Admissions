import { Injectable, NotFoundException } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PdfService {
  constructor(private readonly prisma: PrismaService) {}

  async generateApplicationPdf(applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
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

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Header
    page.drawText('Atria Institute of Technology', {
      x: 50,
      y: height - 50,
      size: 20,
      font: boldFont,
      color: rgb(0, 0.2, 0.6),
    });

    page.drawText('Application Summary', {
      x: 50,
      y: height - 80,
      size: 14,
      font: font,
    });

    // Content
    const startY = height - 130;
    const lineSpacing = 25;

    const data: { label: string; value: string; isHeader?: boolean }[] = [
      { label: 'Application ID:', value: application.id },
      { label: 'Status:', value: application.status.toUpperCase() },
      { label: 'Submission Date:', value: application.submittedAt?.toLocaleDateString() || 'N/A' },
      { label: '', value: '' },
      { label: 'PERSONAL DETAILS', value: '', isHeader: true },
      { label: 'Full Name:', value: `${application.student.firstName} ${application.student.lastName}` },
      { label: 'Email:', value: application.student.email },
      { label: 'Admission Type:', value: application.admissionType.toUpperCase() },
      { label: 'Category:', value: application.category.toUpperCase() },
    ];

    let currentY = startY;
    data.forEach((item) => {
      if (item.isHeader) {
        currentY -= 10;
        page.drawText(item.label, { x: 50, y: currentY, size: 12, font: boldFont });
        currentY -= lineSpacing;
      } else {
        page.drawText(item.label, { x: 50, y: currentY, size: 10, font: font });
        page.drawText(item.value || '', { x: 200, y: currentY, size: 10, font: font });
        currentY -= lineSpacing;
      }
    });

    // Add form data details if available
    let formData: any = {};
    try { formData = JSON.parse(application.formData || '{}'); } catch { /* ignore */ }
    if (formData?.personal) {
      page.drawText('Address:', { x: 50, y: currentY, size: 10, font: font });
      page.drawText(`${formData.personal.city || ''}, ${formData.personal.state || ''}`, { x: 200, y: currentY, size: 10, font: font });
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
