"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const ExcelJS = tslib_1.__importStar(require("exceljs"));
const prisma_service_1 = require("../../prisma/prisma.service");
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
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
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' },
        };
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map