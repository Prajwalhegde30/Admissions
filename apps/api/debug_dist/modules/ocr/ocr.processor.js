"use strict";
var OcrProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrProcessor = void 0;
const tslib_1 = require("tslib");
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = tslib_1.__importStar(require("fs"));
const path = tslib_1.__importStar(require("path"));
const sharp_1 = tslib_1.__importDefault(require("sharp"));
const prisma_service_1 = require("../../prisma/prisma.service");
const storage_service_1 = require("../storage/storage.service");
const marks_10th_parser_1 = require("./parsers/marks-10th.parser");
const marks_12th_parser_1 = require("./parsers/marks-12th.parser");
const kcet_parser_1 = require("./parsers/kcet.parser");
const comedk_parser_1 = require("./parsers/comedk.parser");
const aadhaar_parser_1 = require("./parsers/aadhaar.parser");
let OcrProcessor = OcrProcessor_1 = class OcrProcessor {
    constructor(prisma, storage, config) {
        this.prisma = prisma;
        this.storage = storage;
        this.config = config;
        this.logger = new common_1.Logger(OcrProcessor_1.name);
        this.apiKey = this.config.get('OCR_SPACE_API_KEY', '');
    }
    async handleOcr(job) {
        const { documentId, filePath, documentType } = job.data;
        this.logger.log(`Processing OCR for document ${documentId} (${documentType})`);
        try {
            const absolutePath = this.storage.getAbsolutePath(filePath);
            if (!fs.existsSync(absolutePath)) {
                throw new Error(`File not found: ${absolutePath}`);
            }
            const processedBuffer = await this.preprocessImage(absolutePath);
            let rawText = '';
            try {
                rawText = await this.callOcrSpace(processedBuffer, path.basename(filePath), '2');
            }
            catch (engine2Error) {
                this.logger.warn(`Engine 2 failed for ${documentId}: ${engine2Error instanceof Error ? engine2Error.message : 'unknown'}. Falling back to Engine 1...`);
                rawText = await this.callOcrSpace(processedBuffer, path.basename(filePath), '1');
            }
            if (!rawText || rawText.trim().length < 10) {
                await this.prisma.document.update({
                    where: { id: documentId },
                    data: {
                        ocrStatus: 'failed',
                        ocrError: 'Could not extract readable text. Please upload a clearer, well-lit photo.',
                        ocrRaw: { text: rawText || '' },
                    },
                });
                this.logger.warn(`OCR failed for ${documentId}: insufficient text`);
                return;
            }
            const extracted = this.parseByType(documentType, rawText);
            this.logger.log(`--- Raw OCR text (${rawText.length} chars) ---`);
            this.logger.log(rawText.substring(0, 2000));
            this.logger.log(`--- Parsed fields ---`);
            this.logger.log(JSON.stringify(extracted, null, 2));
            await this.prisma.document.update({
                where: { id: documentId },
                data: {
                    ocrStatus: 'done',
                    ocrRaw: { text: rawText },
                    ocrExtracted: extracted,
                    ocrError: null,
                },
            });
            this.logger.log(`OCR completed for ${documentId}: ${Object.keys(extracted).length} fields extracted`);
        }
        catch (error) {
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
    async preprocessImage(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.pdf') {
            return fs.readFileSync(filePath);
        }
        const processed = await (0, sharp_1.default)(filePath)
            .resize(1800, null, {
            withoutEnlargement: true,
            fit: 'inside',
        })
            .grayscale()
            .normalize()
            .sharpen({
            sigma: 1.5,
        })
            .jpeg({ quality: 85 })
            .toBuffer();
        this.logger.log(`Preprocessed image: ${(fs.statSync(filePath).size / 1024).toFixed(0)}KB → ${(processed.length / 1024).toFixed(0)}KB`);
        return processed;
    }
    async callOcrSpace(buffer, filename, engine) {
        const isPdf = filename.toLowerCase().endsWith('.pdf');
        const mimeType = isPdf ? 'application/pdf' : 'image/jpeg';
        const base64String = `data:${mimeType};base64,${buffer.toString('base64')}`;
        const params = new URLSearchParams();
        params.append('apikey', this.apiKey);
        params.append('base64Image', base64String);
        params.append('language', 'eng');
        params.append('isOverlayRequired', 'false');
        params.append('detectOrientation', 'true');
        params.append('scale', 'true');
        params.append('isTable', 'true');
        params.append('OCREngine', engine);
        this.logger.log(`Calling OCR.space (Engine ${engine}) for ${filename} (${(buffer.length / 1024).toFixed(0)}KB)...`);
        const response = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
        });
        if (!response.ok) {
            throw new Error(`OCR.space API returned ${response.status}: ${response.statusText}`);
        }
        const result = await response.json();
        if (result.IsErroredOnProcessing) {
            const errorMsg = result.ErrorMessage?.[0] || 'Unknown OCR.space error';
            throw new Error(`OCR.space error: ${errorMsg}`);
        }
        const pages = result.ParsedResults || [];
        const fullText = pages
            .map((p) => p.ParsedText || '')
            .join('\n');
        this.logger.log(`OCR.space Engine ${engine} returned ${fullText.length} chars from ${pages.length} page(s)`);
        return fullText;
    }
    parseByType(documentType, rawText) {
        switch (documentType) {
            case 'marks_card_10th':
                return (0, marks_10th_parser_1.parseMarks10th)(rawText);
            case 'marks_card_12th':
                return (0, marks_12th_parser_1.parseMarks12th)(rawText);
            case 'kcet_rank_card':
                return (0, kcet_parser_1.parseKcet)(rawText);
            case 'comedk_rank_card':
                return (0, comedk_parser_1.parseComedk)(rawText);
            case 'aadhaar':
                return (0, aadhaar_parser_1.parseAadhaar)(rawText);
            default:
                return { rawText: rawText.substring(0, 500) };
        }
    }
};
exports.OcrProcessor = OcrProcessor;
tslib_1.__decorate([
    (0, bull_1.Process)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], OcrProcessor.prototype, "handleOcr", null);
exports.OcrProcessor = OcrProcessor = OcrProcessor_1 = tslib_1.__decorate([
    (0, bull_1.Processor)('ocr-processing'),
    tslib_1.__metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService,
        config_1.ConfigService])
], OcrProcessor);
//# sourceMappingURL=ocr.processor.js.map