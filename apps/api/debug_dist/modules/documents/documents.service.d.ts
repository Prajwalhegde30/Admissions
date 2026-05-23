import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { Prisma } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class DocumentsService {
    private readonly prisma;
    private readonly storage;
    private readonly emailService;
    private readonly notificationsService;
    private readonly ocrQueue;
    private readonly logger;
    constructor(prisma: PrismaService, storage: StorageService, emailService: EmailService, notificationsService: NotificationsService, ocrQueue: Queue);
    uploadDocument(studentId: string, applicationId: string, documentType: string, file: Express.Multer.File): Promise<{
        id: string;
        documentType: import("@prisma/client").$Enums.DocumentType;
        status: import("@prisma/client").$Enums.DocumentStatus;
        ocrStatus: string;
        fileName: string | null;
        fileSize: number | null;
        uploadedAt: Date | null;
    }>;
    getMyDocuments(studentId: string): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.DocumentStatus;
        documentType: import("@prisma/client").$Enums.DocumentType;
        fileName: string | null;
        fileSize: number | null;
        mimeType: string | null;
        ocrStatus: string;
        ocrError: string | null;
        uploadedAt: Date | null;
    }[]>;
    getOcrResults(studentId: string, documentId: string): Promise<{
        id: string;
        studentId: string;
        documentType: import("@prisma/client").$Enums.DocumentType;
        ocrExtracted: Prisma.JsonValue;
        ocrConfirmed: Prisma.JsonValue;
        ocrStatus: string;
        ocrError: string | null;
    }>;
    getDocumentUrl(userId: string, documentId: string, role: string): Promise<{
        url: string;
        expiresAt: null;
    }>;
    confirmOcr(studentId: string, documentId: string, confirmedData: Record<string, unknown>): Promise<{
        id: string;
        updatedAt: Date;
        ocrConfirmed: Prisma.JsonValue;
    }>;
    deleteDocument(studentId: string, documentId: string): Promise<{
        message: string;
    }>;
    verifyDocument(documentId: string, adminId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        status: import("@prisma/client").$Enums.DocumentStatus;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        applicationId: string;
        documentType: import("@prisma/client").$Enums.DocumentType;
        fileName: string | null;
        filePath: string | null;
        fileSize: number | null;
        mimeType: string | null;
        ocrRaw: Prisma.JsonValue | null;
        ocrExtracted: Prisma.JsonValue | null;
        ocrConfirmed: Prisma.JsonValue | null;
        ocrStatus: string;
        ocrError: string | null;
        rejectionReason: string | null;
        uploadedAt: Date | null;
    }>;
    rejectDocument(documentId: string, adminId: string, reason: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        status: import("@prisma/client").$Enums.DocumentStatus;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        applicationId: string;
        documentType: import("@prisma/client").$Enums.DocumentType;
        fileName: string | null;
        filePath: string | null;
        fileSize: number | null;
        mimeType: string | null;
        ocrRaw: Prisma.JsonValue | null;
        ocrExtracted: Prisma.JsonValue | null;
        ocrConfirmed: Prisma.JsonValue | null;
        ocrStatus: string;
        ocrError: string | null;
        rejectionReason: string | null;
        uploadedAt: Date | null;
    }>;
}
