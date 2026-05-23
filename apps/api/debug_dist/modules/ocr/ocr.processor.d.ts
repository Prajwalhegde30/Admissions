import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
interface OcrJobData {
    documentId: string;
    filePath: string;
    documentType: string;
}
export declare class OcrProcessor {
    private readonly prisma;
    private readonly storage;
    private readonly config;
    private readonly logger;
    private readonly apiKey;
    constructor(prisma: PrismaService, storage: StorageService, config: ConfigService);
    handleOcr(job: Job<OcrJobData>): Promise<void>;
    private preprocessImage;
    private callOcrSpace;
    private parseByType;
}
export {};
