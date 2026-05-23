"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateApplicationReviewDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class UpdateApplicationReviewDto {
}
exports.UpdateApplicationReviewDto = UpdateApplicationReviewDto;
tslib_1.__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsIn)(['approved', 'rejected']),
    tslib_1.__metadata("design:type", String)
], UpdateApplicationReviewDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateApplicationReviewDto.prototype, "notes", void 0);
//# sourceMappingURL=update-application-review.dto.js.map