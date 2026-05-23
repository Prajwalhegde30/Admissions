"use strict";
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const razorpay_1 = tslib_1.__importDefault(require("razorpay"));
const crypto = tslib_1.__importStar(require("crypto"));
const prisma_service_1 = require("../../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(prisma, config, notifications) {
        this.prisma = prisma;
        this.config = config;
        this.notifications = notifications;
        this.logger = new common_1.Logger(PaymentsService_1.name);
        const keyId = this.config.get('RAZORPAY_KEY_ID');
        const keySecret = this.config.get('RAZORPAY_KEY_SECRET');
        if (keyId && keySecret) {
            this.razorpay = new razorpay_1.default({
                key_id: keyId,
                key_secret: keySecret,
            });
        }
        else {
            this.logger.warn('Razorpay credentials missing. Payment features will be disabled.');
        }
    }
    async createOrder(dto, userId) {
        if (!this.razorpay) {
            throw new common_1.BadRequestException('Payment gateway not configured');
        }
        const application = await this.prisma.application.findUnique({
            where: { id: dto.applicationId },
            include: { student: true },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        if (application.studentId !== userId) {
            throw new common_1.BadRequestException('Unauthorized');
        }
        const amount = this.config.get('APPLICATION_FEE', 500);
        try {
            const order = await this.razorpay.orders.create({
                amount: amount * 100,
                currency: 'INR',
                receipt: `receipt_${application.id.substring(0, 10)}`,
            });
            await this.prisma.payment.create({
                data: {
                    applicationId: application.id,
                    amount: amount,
                    razorpayOrderId: order.id,
                    status: 'pending',
                },
            });
            return {
                orderId: order.id,
                amount: amount * 100,
                currency: 'INR',
                key: this.config.get('RAZORPAY_KEY_ID'),
            };
        }
        catch (error) {
            this.logger.error(`Failed to create Razorpay order: ${error.message}`);
            throw new common_1.BadRequestException('Payment initialization failed');
        }
    }
    async verifyPayment(dto, userId) {
        if (!this.razorpay) {
            throw new common_1.BadRequestException('Payment gateway not configured');
        }
        const body = dto.razorpayOrderId + '|' + dto.razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', this.config.get('RAZORPAY_KEY_SECRET'))
            .update(body.toString())
            .digest('hex');
        const isSignatureValid = expectedSignature === dto.razorpaySignature;
        if (!isSignatureValid) {
            throw new common_1.BadRequestException('Invalid payment signature');
        }
        const payment = await this.prisma.payment.update({
            where: { razorpayOrderId: dto.razorpayOrderId },
            data: {
                status: 'captured',
                razorpayPaymentId: dto.razorpayPaymentId,
                razorpaySignature: dto.razorpaySignature,
            },
            include: { application: true },
        });
        await this.prisma.application.update({
            where: { id: payment.applicationId },
            data: { status: 'paid' },
        });
        await this.notifications.createNotification(userId, 'payment_received', 'Payment Successful', `We have received your application fee of ₹${payment.amount}. Your application is now ready for review.`, { applicationId: payment.applicationId, paymentId: payment.id });
        return { message: 'Payment verified successfully' };
    }
    async handleWebhook(signature, rawBody) {
        const secret = this.config.get('RAZORPAY_WEBHOOK_SECRET');
        if (!secret)
            return;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(rawBody)
            .digest('hex');
        if (expectedSignature !== signature) {
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
        const event = JSON.parse(rawBody);
        if (event.event === 'payment.captured') {
            const orderId = event.payload.payment.entity.order_id;
            const paymentId = event.payload.payment.entity.id;
            const payment = await this.prisma.payment.findUnique({
                where: { razorpayOrderId: orderId },
            });
            if (payment && payment.status !== 'captured') {
                await this.prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: 'captured',
                        razorpayPaymentId: paymentId,
                    },
                });
                await this.prisma.application.update({
                    where: { id: payment.applicationId },
                    data: { status: 'paid' },
                });
            }
        }
        else if (event.event === 'payment.failed') {
            const orderId = event.payload.payment.entity.order_id;
            const reason = event.payload.payment.entity.error_description;
            await this.prisma.payment.updateMany({
                where: { razorpayOrderId: orderId },
                data: {
                    status: 'failed',
                    errorReason: reason,
                },
            });
        }
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        notifications_service_1.NotificationsService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map