import { PrismaService } from '../../prisma/prisma.service';
export declare class PdfService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    generateApplicationPdf(applicationId: string): Promise<Buffer>;
}
