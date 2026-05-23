"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const create_order_dto_1 = require("./dto/create-order.dto");
const verify_payment_dto_1 = require("./dto/verify-payment.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let PaymentsController = class PaymentsController {
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async createOrder(dto, req) {
        return this.paymentsService.createOrder(dto, req.user.id);
    }
    async verifyPayment(dto, req) {
        return this.paymentsService.verifyPayment(dto, req.user.id);
    }
    async handleWebhook(signature, req) {
        if (!signature) {
            throw new common_1.BadRequestException('Missing signature');
        }
        const rawBody = JSON.stringify(req.body);
        return this.paymentsService.handleWebhook(signature, rawBody);
    }
};
exports.PaymentsController = PaymentsController;
tslib_1.__decorate([
    (0, common_1.Post)('create-order'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('student'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PaymentsController.prototype, "createOrder", null);
tslib_1.__decorate([
    (0, common_1.Post)('verify'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('student'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [verify_payment_dto_1.VerifyPaymentDto, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PaymentsController.prototype, "verifyPayment", null);
tslib_1.__decorate([
    (0, common_1.Post)('webhook'),
    tslib_1.__param(0, (0, common_1.Headers)('x-razorpay-signature')),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleWebhook", null);
exports.PaymentsController = PaymentsController = tslib_1.__decorate([
    (0, common_1.Controller)('payments'),
    tslib_1.__metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map