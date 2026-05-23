"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadDocumentDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const DOCUMENT_TYPES = [
    'marks_card_10th', 'marks_card_12th', 'kcet_rank_card', 'comedk_rank_card',
    'aadhaar', 'transfer_certificate', 'migration_certificate',
    'caste_certificate', 'income_certificate', 'medical_certificate',
];
class UploadDocumentDto {
}
exports.UploadDocumentDto = UploadDocumentDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], UploadDocumentDto.prototype, "applicationId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(DOCUMENT_TYPES),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], UploadDocumentDto.prototype, "documentType", void 0);
//# sourceMappingURL=upload-document.dto.js.map