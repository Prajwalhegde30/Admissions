import { Response } from 'express';
import { PdfService } from './pdf.service';
export declare class PdfController {
    private readonly pdfService;
    constructor(pdfService: PdfService);
    downloadApplicationPdf(id: string, res: Response, req: any): Promise<void>;
}
