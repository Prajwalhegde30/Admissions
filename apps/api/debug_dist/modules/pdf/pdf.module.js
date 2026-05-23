"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const pdf_service_1 = require("./pdf.service");
const pdf_controller_1 = require("./pdf.controller");
let PdfModule = class PdfModule {
};
exports.PdfModule = PdfModule;
exports.PdfModule = PdfModule = tslib_1.__decorate([
    (0, common_1.Module)({
        controllers: [pdf_controller_1.PdfController],
        providers: [pdf_service_1.PdfService],
        exports: [pdf_service_1.PdfService],
    })
], PdfModule);
//# sourceMappingURL=pdf.module.js.map