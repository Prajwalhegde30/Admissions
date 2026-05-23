"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyPaymentDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class VerifyPaymentDto {
}
exports.VerifyPaymentDto = VerifyPaymentDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], VerifyPaymentDto.prototype, "razorpayOrderId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], VerifyPaymentDto.prototype, "razorpayPaymentId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], VerifyPaymentDto.prototype, "razorpaySignature", void 0);
//# sourceMappingURL=verify-payment.dto.js.map