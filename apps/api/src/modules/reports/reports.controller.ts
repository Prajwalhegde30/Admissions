import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('export-applications')
  async exportApplications(@Res() res: Response) {
    const buffer = await this.reportsService.exportApplicationsToExcel();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=applications_report.xlsx',
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
