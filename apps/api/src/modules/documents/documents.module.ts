import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { GroqOcrService } from './groq-ocr.service';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MulterModule.register({
      storage: undefined, // Use memory storage (buffer), we handle file saving in StorageService
    }),
    EmailModule,
    NotificationsModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, GroqOcrService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
