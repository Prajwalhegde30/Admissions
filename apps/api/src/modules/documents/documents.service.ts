import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { GroqOcrService } from './groq-ocr.service';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
    private readonly groqOcr: GroqOcrService,
  ) {}

  /**
   * Upload a document file.
   */
  async uploadDocument(
    studentId: string,
    applicationId: string,
    documentType: string,
    file: Express.Multer.File,
  ) {
    // Verify the application belongs to this student
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      select: { id: true, studentId: true },
    });

    if (!application || application.studentId !== studentId) {
      throw new ForbiddenException('Application not found or access denied');
    }

    // Check if document already exists for this type
    const existing = await this.prisma.document.findUnique({
      where: {
        applicationId_documentType: {
          applicationId,
          documentType,
        },
      },
      select: { id: true, status: true, filePath: true },
    });

    if (existing && existing.status === 'verified') {
      throw new BadRequestException('This document has already been verified and cannot be replaced');
    }

    // Store file
    const ext = file.originalname.split('.').pop() || 'bin';
    const storagePath = `${studentId}/${applicationId}/${documentType}.${ext}`;
    await this.storage.upload(file, storagePath);

    // Delete old file if replacing
    if (existing?.filePath && existing.filePath !== storagePath) {
      await this.storage.delete(existing.filePath);
    }

    // Upsert document record
    const document = existing
      ? await this.prisma.document.update({
          where: { id: existing.id },
          data: {
            fileName: file.originalname,
            filePath: storagePath,
            fileSize: file.size,
            mimeType: file.mimetype,
            status: 'uploaded',
            ocrStatus: 'processing',
            ocrRaw: null,
            ocrExtracted: null,
            ocrConfirmed: null,
            ocrError: null,
            uploadedAt: new Date(),
          },
        })
      : await this.prisma.document.create({
          data: {
            applicationId,
            studentId,
            documentType,
            fileName: file.originalname,
            filePath: storagePath,
            fileSize: file.size,
            mimeType: file.mimetype,
            status: 'uploaded',
            ocrStatus: 'processing',
            uploadedAt: new Date(),
          },
        });

    // Run OCR directly (no queue) for supported types
    const ocrableTypes = [
      'marks_card_10th', 'marks_card_12th', 'kcet_rank_card',
      'comedk_rank_card', 'aadhaar',
    ];

    if (ocrableTypes.includes(documentType)) {
      // Run OCR asynchronously but don't block the response
      this.runOcrInBackground(document.id, storagePath, documentType);
    } else {
      // Non-OCR documents go straight to 'uploaded' status
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

  /**
   * Run Groq OCR in the background (fire-and-forget).
   */
  private async runOcrInBackground(documentId: string, filePath: string, documentType: string) {
    try {
      const absolutePath = this.storage.getAbsolutePath(filePath);
      const result = await this.groqOcr.processDocument(absolutePath, documentType);

      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          ocrStatus: Object.keys(result.extracted).length > 1 ? 'done' : 'failed',
          ocrRaw: result.rawText,
          ocrExtracted: JSON.stringify(result.extracted),
          ocrError: Object.keys(result.extracted).length > 1 ? null : 'Could not extract sufficient data',
        },
      });

      this.logger.log(`OCR completed for ${documentId}: ${Object.keys(result.extracted).length} fields`);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown OCR error';
      this.logger.error(`OCR error for ${documentId}: ${errMsg}`);

      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          ocrStatus: 'failed',
          ocrError: `OCR processing failed: ${errMsg}. You can enter the details manually.`,
        },
      });
    }
  }

  /**
   * List documents for a student's application.
   */
  async getMyDocuments(studentId: string) {
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

  /**
   * Get OCR results for a document.
   */
  async getOcrResults(studentId: string, documentId: string) {
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
      throw new NotFoundException('Document not found');
    }

    // Parse JSON strings back for the response
    return {
      ...doc,
      ocrExtracted: doc.ocrExtracted ? JSON.parse(doc.ocrExtracted) : null,
      ocrConfirmed: doc.ocrConfirmed ? JSON.parse(doc.ocrConfirmed) : null,
    };
  }

  /**
   * Get a URL to view a document file.
   */
  async getDocumentUrl(userId: string, documentId: string, role: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
      select: { id: true, studentId: true, filePath: true },
    });

    if (!doc || !doc.filePath) {
      throw new NotFoundException('Document not found');
    }

    if (role === 'student' && doc.studentId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return {
      url: this.storage.getUrl(doc.filePath),
      expiresAt: null, // Local storage doesn't expire
    };
  }

  /**
   * Confirm OCR extracted data.
   */
  async confirmOcr(studentId: string, documentId: string, confirmedData: Record<string, unknown>) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
      select: { id: true, studentId: true, ocrStatus: true },
    });

    if (!doc || doc.studentId !== studentId) {
      throw new NotFoundException('Document not found');
    }

    const updated = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        ocrConfirmed: JSON.stringify(confirmedData),
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

  /**
   * Delete a document (only if not yet verified).
   */
  async deleteDocument(studentId: string, documentId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
      select: { id: true, studentId: true, status: true, filePath: true },
    });

    if (!doc || doc.studentId !== studentId) {
      throw new NotFoundException('Document not found');
    }

    if (doc.status === 'verified') {
      throw new BadRequestException('Cannot delete a verified document');
    }

    if (doc.filePath) {
      await this.storage.delete(doc.filePath);
    }

    await this.prisma.document.delete({ where: { id: documentId } });

    return { message: 'Document removed' };
  }

  // ─── ADMIN ENDPOINTS ────────────────────────────────────────────────────────

  /**
   * PATCH /documents/:id/verify
   */
  async verifyDocument(documentId: string, adminId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      throw new NotFoundException('Document not found');
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
      await this.notificationsService.createNotification(
        doc.studentId,
        'document_verified',
        'Document Verified',
        `Your ${doc.documentType.replace(/_/g, ' ')} has been verified.`
      );
      await this.emailService.sendNotificationEmail({
        to: student.email,
        subject: 'Document Verified',
        heading: 'Document Verified',
        body: `Your uploaded document <strong>${doc.documentType.replace(/_/g, ' ')}</strong> has been verified by our team.`
      });
    }

    return updated;
  }

  /**
   * PATCH /documents/:id/reject
   */
  async rejectDocument(documentId: string, adminId: string, reason: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    if (!reason) {
      throw new BadRequestException('Rejection reason is required');
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
      await this.notificationsService.createNotification(
        doc.studentId,
        'document_rejected',
        'Document Rejected',
        `Your ${doc.documentType.replace(/_/g, ' ')} has been rejected. Reason: ${reason}`
      );
      await this.emailService.sendNotificationEmail({
        to: student.email,
        subject: 'Document Rejected',
        heading: 'Action Required: Document Rejected',
        body: `Your uploaded document <strong>${doc.documentType.replace(/_/g, ' ')}</strong> has been rejected by our team.<br/><br/><strong>Reason:</strong> ${reason}<br/><br/>Please upload a clearer or correct document in your portal.`
      });
    }

    return updated;
  }
}
