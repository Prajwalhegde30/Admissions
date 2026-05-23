"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateInviteDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class CreateInviteDto {
}
exports.CreateInviteDto = CreateInviteDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    tslib_1.__metadata("design:type", String)
], CreateInviteDto.prototype, "firstName", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    tslib_1.__metadata("design:type", String)
], CreateInviteDto.prototype, "lastName", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], CreateInviteDto.prototype, "email", void 0);
//# sourceMappingURL=create-invite.dto.js.map