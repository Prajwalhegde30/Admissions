"use strict";
var DocumentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../../prisma/prisma.service");
const storage_service_1 = require("../storage/storage.service");
const client_1 = require("@prisma/client");
const email_service_1 = require("../email/email.service");
const notifications_service_1 = require("../notifications/notifications.service");
let DocumentsService = DocumentsService_1 = class DocumentsService {
    constructor(prisma, storage, emailService, notificationsService, ocrQueue) {
        this.prisma = prisma;
        this.storage = storage;
        this.emailService = emailService;
        this.notificationsService = notificationsService;
        this.ocrQueue = ocrQueue;
        this.logger = new common_1.Logger(DocumentsService_1.name);
    }
    async uploadDocument(studentId, applicationId, documentType, file) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            select: { id: true, studentId: true },
        });
        if (!application || application.studentId !== studentId) {
            throw new common_1.ForbiddenException('Application not found or access denied');
        }
        const existing = await this.prisma.document.findUnique({
            where: {
                applicationId_documentType: {
                    applicationId,
                    documentType: documentType,
                },
            },
            select: { id: true, status: true, filePath: true },
        });
        if (existing && existing.status === 'verified') {
            throw new common_1.BadRequestException('This document has already been verified and cannot be replaced');
        }
        const ext = file.originalname.split('.').pop() || 'bin';
        const storagePath = `${studentId}/${applicationId}/${documentType}.${ext}`;
        await this.storage.upload(file, storagePath);
        if (existing?.filePath && existing.filePath !== storagePath) {
            await this.storage.delete(existing.filePath);
        }
        const document = existing
            ? await this.prisma.document.update({
                where: { id: existing.id },
                data: {
                    fileName: file.originalname,
                    filePath: storagePath,
                    fileSize: file.size,
                    mimeType: file.mimetype,
                    status: 'uploaded',
                    ocrStatus: 'pending',
                    ocrRaw: client_1.Prisma.DbNull,
                    ocrExtracted: client_1.Prisma.DbNull,
                    ocrConfirmed: client_1.Prisma.DbNull,
                    ocrError: null,
                    uploadedAt: new Date(),
                },
            })
            : await this.prisma.document.create({
                data: {
                    applicationId,
                    studentId,
                    documentType: documentType,
                    fileName: file.originalname,
                    filePath: storagePath,
                    fileSize: file.size,
                    mimeType: file.mimetype,
                    status: 'uploaded',
                    ocrStatus: 'pending',
                    uploadedAt: new Date(),
                },
            });
        const ocrableTypes = [
            'marks_card_10th', 'marks_card_12th', 'kcet_rank_card',
            'comedk_rank_card', 'aadhaar',
        ];
        if (ocrableTypes.includes(documentType)) {
            await this.ocrQueue.add({
                documentId: document.id,
                filePath: storagePath,
                documentType,
            }, {
                attempts: 2,
                backoff: { type: 'exponential', delay: 3000 },
            });
            this.logger.log(`Enqueued OCR job for document ${document.id}`);
        }
        else {
            await this.prisma.document.update({
                where: { id: document.id },
                data: { ocrStatus: 'not_applicable' },
            });
        }
        return {
            id: document.id,
            documentType: document.documentType,
            status: document.status,
            ocrStatus: document.ocrStatus,
            fileName: document.fileName,
            fileSize: document.fileSize,
            uploadedAt: document.uploadedAt,
        };
    }
    async getMyDocuments(studentId) {
        const application = await this.prisma.application.findUnique({
            where: { studentId },
            select: { id: true },
        });
        if (!application) {
            return [];
        }
        return this.prisma.document.findMany({
            where: { applicationId: application.id },
            select: {
                id: true,
                documentType: true,
                status: true,
                fileName: true,
                fileSize: true,
                mimeType: true,
                ocrStatus: true,
                ocrError: true,
                uploadedAt: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async getOcrResults(studentId, documentId) {
        const doc = await this.prisma.document.findUnique({
            where: { id: documentId },
            select: {
                id: true,
                studentId: true,
                documentType: true,
                ocrStatus: true,
                ocrExtracted: true,
                ocrConfirmed: true,
                ocrError: true,
            },
        });
        if (!doc || doc.studentId !== studentId) {
            throw new common_1.NotFoundException('Document not found');
        }
        return doc;
    }
    async getDocumentUrl(userId, documentId, role) {
        const doc = await this.prisma.document.findUnique({
            where: { id: documentId },
            select: { id: true, studentId: true, filePath: true },
        });
        if (!doc || !doc.filePath) {
            throw new common_1.NotFoundException('Document not found');
        }
        if (role === 'student' && doc.studentId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return {
            url: this.storage.getUrl(doc.filePath),
            expiresAt: null,
        };
    }
    async confirmOcr(studentId, documentId, confirmedData) {
        const doc = await this.prisma.document.findUnique({
            where: { id: documentId },
            select: { id: true, studentId: true, ocrStatus: true },
        });
        if (!doc || doc.studentId !== studentId) {
            throw new common_1.NotFoundException('Document not found');
        }
        const updated = await this.prisma.document.update({
            where: { id: documentId },
            data: {
                ocrConfirmed: confirmedData,
            },
            select: {
                id: true,
                ocrConfirmed: true,
                updatedAt: true,
            },
        });
        this.logger.log(`OCR confirmed for document ${documentId}`);
        return updated;
    }
    async deleteDocument(studentId, documentId) {
        const doc = await this.prisma.document.findUnique({
            where: { id: documentId },
            select: { id: true, studentId: true, status: true, filePath: true },
        });
        if (!doc || doc.studentId !== studentId) {
            throw new common_1.NotFoundException('Document not found');
        }
        if (doc.status === 'verified') {
            throw new common_1.BadRequestException('Cannot delete a verified document');
        }
        if (doc.filePath) {
            await this.storage.delete(doc.filePath);
        }
        await this.prisma.document.delete({ where: { id: documentId } });
        return { message: 'Document removed' };
    }
    async verifyDocument(documentId, adminId) {
        const doc = await this.prisma.document.findUnique({
            where: { id: documentId },
        });
        if (!doc) {
            throw new common_1.NotFoundException('Document not found');
        }
        const updated = await this.prisma.document.update({
            where: { id: documentId },
            data: {
                status: 'verified',
                reviewedBy: adminId,
                reviewedAt: new Date(),
                rejectionReason: null,
            },
        });
        this.logger.log(`Document ${documentId} verified by admin ${adminId}`);
        const student = await this.prisma.user.findUnique({ where: { id: doc.studentId } });
        if (student) {
            await this.notificationsService.createNotification(doc.studentId, 'document_verified', 'Document Verified', `Your ${doc.documentType.replace(/_/g, ' ')} has been verified.`);
            await this.emailService.sendNotificationEmail({
                to: student.email,
                subject: 'Document Verified',
                heading: 'Document Verified',
                body: `Your uploaded document <strong>${doc.documentType.replace(/_/g, ' ')}</strong> has been verified by our team.`
            });
        }
        return updated;
    }
    async rejectDocument(documentId, adminId, reason) {
        const doc = await this.prisma.document.findUnique({
            where: { id: documentId },
        });
        if (!doc) {
            throw new common_1.NotFoundException('Document not found');
        }
        if (!reason) {
            throw new common_1.BadRequestException('Rejection reason is required');
        }
        const updated = await this.prisma.document.update({
            where: { id: documentId },
            data: {
                status: 'rejected',
                reviewedBy: adminId,
                reviewedAt: new Date(),
                rejectionReason: reason,
            },
        });
        this.logger.log(`Document ${documentId} rejected by admin ${adminId}. Reason: ${reason}`);
        const student = await this.prisma.user.findUnique({ where: { id: doc.studentId } });
        if (student) {
            await this.notificationsService.createNotification(doc.studentId, 'document_rejected', 'Document Rejected', `Your ${doc.documentType.replace(/_/g, ' ')} has been rejected. Reason: ${reason}`);
            await this.emailService.sendNotificationEmail({
                to: student.email,
                subject: 'Document Rejected',
                heading: 'Action Required: Document Rejected',
                body: `Your uploaded document <strong>${doc.documentType.replace(/_/g, ' ')}</strong> has been rejected by our team.<br/><br/><strong>Reason:</strong> ${reason}<br/><br/>Please upload a clearer or correct document in your portal.`
            });
        }
        return updated;
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = DocumentsService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(4, (0, bull_1.InjectQueue)('ocr-processing')),
    tslib_1.__metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService,
        email_service_1.EmailService,
        notifications_service_1.NotificationsService, Object])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map