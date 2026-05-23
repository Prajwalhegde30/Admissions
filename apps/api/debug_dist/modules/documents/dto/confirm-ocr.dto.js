"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmOcrDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class ConfirmOcrDto {
}
exports.ConfirmOcrDto = ConfirmOcrDto;
tslib_1.__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", Object)
], ConfirmOcrDto.prototype, "confirmedData", void 0);
//# sourceMappingURL=confirm-ocr.dto.js.map