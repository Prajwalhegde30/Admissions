"use strict";
var ApplicationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const notifications_service_1 = require("../notifications/notifications.service");
let ApplicationsService = ApplicationsService_1 = class ApplicationsService {
    constructor(prisma, emailService, notificationsService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(ApplicationsService_1.name);
    }
    async getMyApplication(studentId) {
        let application = await this.prisma.application.findUnique({
            where: { studentId },
            select: {
                id: true,
                studentId: true,
                admissionType: true,
                category: true,
                status: true,
                formData: true,
                submittedAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!application) {
            const profile = await this.prisma.studentProfile.findUnique({
                where: { userId: studentId },
                select: { admissionType: true, category: true },
            });
            application = await this.prisma.application.create({
                data: {
                    studentId,
                    admissionType: profile?.admissionType || 'kcet',
                    category: profile?.category || 'general',
                    status: 'draft',
                    formData: {},
                },
                select: {
                    id: true,
                    studentId: true,
                    admissionType: true,
                    category: true,
                    status: true,
                    formData: true,
                    submittedAt: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            this.logger.log(`Created new application for student ${studentId}`);
        }
        return application;
    }
    async saveDraft(studentId, dto) {
        const application = await this.prisma.application.findUnique({
            where: { studentId },
            select: { id: true, status: true, formData: true },
        });
        if (!application) {
            throw new common_1.NotFoundException('No application found. Please access your application first.');
        }
        if (application.status !== 'draft') {
            throw new common_1.BadRequestException('Cannot modify a submitted application');
        }
        const currentData = application.formData || {};
        if (dto.fields && dto.fields.length > 0) {
            for (const field of dto.fields) {
                this.setNestedValue(currentData, field.fieldPath, field.value);
            }
        }
        else if (dto.fieldPath) {
            this.setNestedValue(currentData, dto.fieldPath, dto.value);
        }
        else {
            throw new common_1.BadRequestException('Either fieldPath or fields[] is required');
        }
        await this.prisma.application.update({
            where: { id: application.id },
            data: { formData: currentData },
        });
        return { savedAt: new Date().toISOString() };
    }
    async submitApplication(studentId, dto) {
        const application = await this.prisma.application.findUnique({
            where: { studentId },
            select: {
                id: true,
                status: true,
                formData: true,
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('No application found');
        }
        if (application.status !== 'draft') {
            throw new common_1.BadRequestException('Application has already been submitted');
        }
        const result = await this.prisma.application.update({
            where: { id: application.id },
            data: {
                admissionType: dto.admissionType,
                category: dto.category,
                status: 'payment_pending',
                submittedAt: new Date(),
            },
            select: {
                id: true,
                status: true,
                submittedAt: true,
            },
        });
        await this.prisma.studentProfile.update({
            where: { userId: studentId },
            data: {
                admissionType: dto.admissionType,
                category: dto.category,
            },
        });
        this.logger.log(`Application ${result.id} submitted by student ${studentId}`);
        const student = await this.prisma.user.findUnique({ where: { id: studentId } });
        if (student) {
            await this.notificationsService.createNotification(studentId, 'application_submitted', 'Application Received', 'Your application has been received. Please proceed to pay the application fee to start the review process.');
            await this.emailService.sendNotificationEmail({
                to: student.email,
                subject: 'Application Received - Payment Required',
                heading: 'Action Required: Payment',
                body: 'Your admission application has been received. Please log in to the portal and pay the application fee to move your application to the review stage.'
            });
        }
        return result;
    }
    async getMyProfile(studentId) {
        const profile = await this.prisma.studentProfile.findUnique({
            where: { userId: studentId },
            include: {
                user: {
                    select: {
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        return profile;
    }
    async updateProfile(studentId, dto) {
        const profile = await this.prisma.studentProfile.findUnique({
            where: { userId: studentId },
            select: { id: true },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const updateData = {};
        for (const [key, value] of Object.entries(dto)) {
            if (value !== undefined && value !== null) {
                if (key === 'dateOfBirth') {
                    updateData[key] = new Date(value);
                }
                else {
                    updateData[key] = value;
                }
            }
        }
        const updated = await this.prisma.studentProfile.update({
            where: { userId: studentId },
            data: updateData,
        });
        return updated;
    }
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
    }
    async getApplicationStats() {
        const counts = await this.prisma.application.groupBy({
            by: ['status'],
            _count: true,
        });
        const result = {
            draft: 0,
            payment_pending: 0,
            paid: 0,
            submitted: 0,
            under_review: 0,
            approved: 0,
            rejected: 0,
            correction_requested: 0,
            total: 0,
        };
        for (const group of counts) {
            result[group.status] = group._count;
            result.total += group._count;
        }
        return result;
    }
    async listApplications(filters) {
        const { status, admissionType, category, search, page = 1, limit = 10 } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        if (admissionType)
            where.admissionType = admissionType;
        if (category)
            where.category = category;
        if (search) {
            where.student = {
                OR: [
                    { email: { contains: search, mode: 'insensitive' } },
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                ],
            };
        }
        const [items, total] = await Promise.all([
            this.prisma.application.findMany({
                where,
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' },
                include: {
                    student: { select: { email: true, firstName: true, lastName: true } },
                },
            }),
            this.prisma.application.count({ where }),
        ]);
        return {
            data: items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getApplicationById(id) {
        const application = await this.prisma.application.findUnique({
            where: { id },
            include: {
                student: {
                    select: { email: true, firstName: true, lastName: true },
                },
                documents: true,
                correctionRequests: true,
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        const profile = await this.prisma.studentProfile.findUnique({
            where: { userId: application.studentId },
        });
        const validationWarnings = [];
        const docs = application.documents || [];
        const tenthDoc = docs.find(d => d.documentType === 'marks_card_10th')?.ocrConfirmed;
        const twelfthDoc = docs.find(d => d.documentType === 'marks_card_12th')?.ocrConfirmed;
        const aadhaarDoc = docs.find(d => d.documentType === 'aadhaar')?.ocrConfirmed;
        const names = new Set();
        const dobs = new Set();
        if (tenthDoc?.fullName)
            names.add(tenthDoc.fullName.toUpperCase().trim());
        if (twelfthDoc?.fullName)
            names.add(twelfthDoc.fullName.toUpperCase().trim());
        if (aadhaarDoc?.fullName)
            names.add(aadhaarDoc.fullName.toUpperCase().trim());
        if (tenthDoc?.dateOfBirth)
            dobs.add(tenthDoc.dateOfBirth.trim());
        if (twelfthDoc?.dateOfBirth)
            dobs.add(twelfthDoc.dateOfBirth.trim());
        if (aadhaarDoc?.dateOfBirth)
            dobs.add(aadhaarDoc.dateOfBirth.trim());
        if (names.size > 1) {
            validationWarnings.push('Name mismatch detected across uploaded documents.');
        }
        if (dobs.size > 1) {
            validationWarnings.push('Date of Birth mismatch detected across uploaded documents.');
        }
        return { ...application, profile, validationWarnings };
    }
    async reviewApplication(id, status, adminId, notes) {
        const application = await this.prisma.application.findUnique({
            where: { id },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        const updated = await this.prisma.application.update({
            where: { id },
            data: {
                status,
                adminNotes: notes,
                reviewedBy: adminId,
                reviewedAt: new Date(),
            },
        });
        this.logger.log(`Application ${id} reviewed by ${adminId}: ${status}`);
        const student = await this.prisma.user.findUnique({ where: { id: application.studentId } });
        if (student) {
            const isApproved = status === 'approved';
            await this.notificationsService.createNotification(student.id, isApproved ? 'application_approved' : 'application_rejected', `Application ${isApproved ? 'Approved' : 'Rejected'}`, isApproved
                ? 'Congratulations! Your admission application has been approved.'
                : 'Your admission application has been rejected. Please contact the admissions office.');
            await this.emailService.sendNotificationEmail({
                to: student.email,
                subject: `Application ${isApproved ? 'Approved' : 'Rejected'}`,
                heading: `Application ${isApproved ? 'Approved' : 'Rejected'}`,
                body: isApproved
                    ? 'Congratulations! Your admission application has been approved by the admissions office.'
                    : `Your admission application has been rejected.<br/><br/>Notes: ${notes || 'No reason provided.'}`
            });
        }
        return updated;
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = ApplicationsService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        notifications_service_1.NotificationsService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map