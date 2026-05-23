"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaveDraftDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class FieldUpdate {
}
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], FieldUpdate.prototype, "fieldPath", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", Object)
], FieldUpdate.prototype, "value", void 0);
class SaveDraftDto {
}
exports.SaveDraftDto = SaveDraftDto;
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], SaveDraftDto.prototype, "fieldPath", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Object)
], SaveDraftDto.prototype, "value", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FieldUpdate),
    tslib_1.__metadata("design:type", Array)
], SaveDraftDto.prototype, "fields", void 0);
//# sourceMappingURL=save-draft.dto.js.map