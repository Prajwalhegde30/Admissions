import { Controller, Get, Param, Res, UseGuards, Req } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('application/:id')
  @UseGuards(JwtAuthGuard)
  async downloadApplicationPdf(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: any
  ) {
    // In a real app, verify that the user owns the application or is an admin
    const buffer = await this.pdfService.generateApplicationPdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=application_${id.substring(0, 8)}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
