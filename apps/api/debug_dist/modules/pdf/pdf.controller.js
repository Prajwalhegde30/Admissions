"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const pdf_service_1 = require("./pdf.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let PdfController = class PdfController {
    constructor(pdfService) {
        this.pdfService = pdfService;
    }
    async downloadApplicationPdf(id, res, req) {
        const buffer = await this.pdfService.generateApplicationPdf(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=application_${id.substring(0, 8)}.pdf`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
};
exports.PdfController = PdfController;
tslib_1.__decorate([
    (0, common_1.Get)('application/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Res)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PdfController.prototype, "downloadApplicationPdf", null);
exports.PdfController = PdfController = tslib_1.__decorate([
    (0, common_1.Controller)('pdf'),
    tslib_1.__metadata("design:paramtypes", [pdf_service_1.PdfService])
], PdfController);
//# sourceMappingURL=pdf.controller.js.map