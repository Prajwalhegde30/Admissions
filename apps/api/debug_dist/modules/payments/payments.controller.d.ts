import { PaymentsService } from './payments.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createOrder(dto: CreateOrderDto, req: any): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        key: string | undefined;
    }>;
    verifyPayment(dto: VerifyPaymentDto, req: any): Promise<{
        message: string;
    }>;
    handleWebhook(signature: string, req: any): Promise<void>;
}
