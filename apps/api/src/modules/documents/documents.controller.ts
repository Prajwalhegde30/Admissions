import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { ConfirmOcrDto } from './dto/confirm-ocr.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * POST /v1/documents — Upload a document (multipart/form-data)
   */
  @Post()
  @Roles('student')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }))
  async uploadDocument(
    @CurrentUser('id') studentId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf)$/i }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('applicationId') applicationId: string,
    @Body('documentType') documentType: string,
  ) {
    return this.documentsService.uploadDocument(studentId, applicationId, documentType, file);
  }

  /**
   * GET /v1/documents/mine — List my documents
   */
  @Get('mine')
  @Roles('student')
  async getMyDocuments(@CurrentUser('id') studentId: string) {
    return this.documentsService.getMyDocuments(studentId);
  }

  /**
   * GET /v1/documents/:id/ocr — Get OCR results
   */
  @Get(':id/ocr')
  @Roles('student')
  async getOcrResults(
    @CurrentUser('id') studentId: string,
    @Param('id') documentId: string,
  ) {
    return this.documentsService.getOcrResults(studentId, documentId);
  }

  /**
   * GET /v1/documents/:id/url — Get file URL (Student + Admin)
   */
  @Get(':id/url')
  @Roles('student', 'admin', 'super_admin')
  async getDocumentUrl(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Param('id') documentId: string,
  ) {
    return this.documentsService.getDocumentUrl(userId, documentId, role);
  }

  /**
   * PATCH /v1/documents/:id/confirm-ocr — Confirm OCR data
   */
  @Patch(':id/confirm-ocr')
  @Roles('student')
  @HttpCode(HttpStatus.OK)
  async confirmOcr(
    @CurrentUser('id') studentId: string,
    @Param('id') documentId: string,
    @Body() dto: ConfirmOcrDto,
  ) {
    return this.documentsService.confirmOcr(studentId, documentId, dto.confirmedData);
  }

  /**
   * DELETE /v1/documents/:id — Delete a document
   */
  @Delete(':id')
  @Roles('student')
  @HttpCode(HttpStatus.OK)
  async deleteDocument(
    @CurrentUser('id') studentId: string,
    @Param('id') documentId: string,
  ) {
    return this.documentsService.deleteDocument(studentId, documentId);
  }

  // ─── ADMIN ENDPOINTS ────────────────────────────────────────────────────────

  /**
   * PATCH /v1/documents/:id/verify
   */
  @Patch(':id/verify')
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  async verifyDocument(
    @Param('id') documentId: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.documentsService.verifyDocument(documentId, adminId);
  }

  /**
   * PATCH /v1/documents/:id/reject
   */
  @Patch(':id/reject')
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  async rejectDocument(
    @Param('id') documentId: string,
    @CurrentUser('id') adminId: string,
    @Body('reason') reason: string,
  ) {
    return this.documentsService.rejectDocument(documentId, adminId, reason);
  }
}
