"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const pdf_lib_1 = require("pdf-lib");
const prisma_service_1 = require("../../prisma/prisma.service");
let PdfService = class PdfService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateApplicationPdf(applicationId) {
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
            throw new common_1.NotFoundException('Application not found');
        }
        const pdfDoc = await pdf_lib_1.PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
        page.drawText('Atria Institute of Technology', {
            x: 50,
            y: height - 50,
            size: 20,
            font: boldFont,
            color: (0, pdf_lib_1.rgb)(0, 0.2, 0.6),
        });
        page.drawText('Application Summary', {
            x: 50,
            y: height - 80,
            size: 14,
            font: font,
        });
        const startY = height - 130;
        const lineSpacing = 25;
        const data = [
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
            }
            else {
                page.drawText(item.label, { x: 50, y: currentY, size: 10, font: font });
                page.drawText(item.value || '', { x: 200, y: currentY, size: 10, font: font });
                currentY -= lineSpacing;
            }
        });
        const formData = application.formData;
        if (formData && formData.personal) {
            page.drawText('Address:', { x: 50, y: currentY, size: 10, font: font });
            page.drawText(`${formData.personal.city || ''}, ${formData.personal.state || ''}`, { x: 200, y: currentY, size: 10, font: font });
        }
        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PdfService);
//# sourceMappingURL=pdf.service.js.map