import { DocumentsService } from './documents.service';
import { ConfirmOcrDto } from './dto/confirm-ocr.dto';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    uploadDocument(studentId: string, file: Express.Multer.File, applicationId: string, documentType: string): Promise<{
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
        ocrExtracted: import("@prisma/client/runtime/library").JsonValue;
        ocrConfirmed: import("@prisma/client/runtime/library").JsonValue;
        ocrStatus: string;
        ocrError: string | null;
    }>;
    getDocumentUrl(userId: string, role: string, documentId: string): Promise<{
        url: string;
        expiresAt: null;
    }>;
    confirmOcr(studentId: string, documentId: string, dto: ConfirmOcrDto): Promise<{
        id: string;
        updatedAt: Date;
        ocrConfirmed: import("@prisma/client/runtime/library").JsonValue;
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
        ocrRaw: import("@prisma/client/runtime/library").JsonValue | null;
        ocrExtracted: import("@prisma/client/runtime/library").JsonValue | null;
        ocrConfirmed: import("@prisma/client/runtime/library").JsonValue | null;
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
        ocrRaw: import("@prisma/client/runtime/library").JsonValue | null;
        ocrExtracted: import("@prisma/client/runtime/library").JsonValue | null;
        ocrConfirmed: import("@prisma/client/runtime/library").JsonValue | null;
        ocrStatus: string;
        ocrError: string | null;
        rejectionReason: string | null;
        uploadedAt: Date | null;
    }>;
}
