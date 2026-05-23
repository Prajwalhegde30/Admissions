"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const ocr_processor_1 = require("./ocr.processor");
let OcrModule = class OcrModule {
};
exports.OcrModule = OcrModule;
exports.OcrModule = OcrModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            bull_1.BullModule.registerQueue({
                name: 'ocr-processing',
            }),
        ],
        providers: [ocr_processor_1.OcrProcessor],
        exports: [bull_1.BullModule],
    })
], OcrModule);
//# sourceMappingURL=ocr.module.js.map