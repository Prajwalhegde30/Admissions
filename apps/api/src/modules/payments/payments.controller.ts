import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async createOrder(@Body() dto: CreateOrderDto, @Req() req: any) {
    return this.paymentsService.createOrder(dto, req.user.id);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async verifyPayment(@Body() dto: VerifyPaymentDto, @Req() req: any) {
    return this.paymentsService.verifyPayment(dto, req.user.id);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Req() req: any,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing signature');
    }
    // Note: In a real app, use raw-body middleware to get the exact raw payload for signature verification
    const rawBody = JSON.stringify(req.body);
    return this.paymentsService.handleWebhook(signature, rawBody);
  }
}
