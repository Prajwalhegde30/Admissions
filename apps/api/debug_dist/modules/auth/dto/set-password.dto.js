"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetPasswordDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class SetPasswordDto {
}
exports.SetPasswordDto = SetPasswordDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], SetPasswordDto.prototype, "inviteToken", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    }),
    tslib_1.__metadata("design:type", String)
], SetPasswordDto.prototype, "password", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], SetPasswordDto.prototype, "confirmPassword", void 0);
//# sourceMappingURL=set-password.dto.js.map