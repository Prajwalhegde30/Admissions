"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitApplicationDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class SubmitApplicationDto {
}
exports.SubmitApplicationDto = SubmitApplicationDto;
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(['kcet', 'comedk', 'management']),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], SubmitApplicationDto.prototype, "admissionType", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(['general', 'sc', 'st', 'obc', 'ph']),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], SubmitApplicationDto.prototype, "category", void 0);
//# sourceMappingURL=submit-application.dto.js.map