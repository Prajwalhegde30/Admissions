import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { SaveDraftDto } from './dto/save-draft.dto';
import { SubmitApplicationDto } from './dto/submit-application.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateApplicationReviewDto } from './dto/update-application-review.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Param, Query } from '@nestjs/common';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  /**
   * GET /v1/applications/mine
   * Get the current student's application (auto-creates if none exists).
   */
  @Get('mine')
  @Roles('student')
  async getMyApplication(@CurrentUser('id') studentId: string) {
    return this.applicationsService.getMyApplication(studentId);
  }

  /**
   * PATCH /v1/applications/mine/draft
   * Auto-save form data (called on field blur, debounced).
   */
  @Patch('mine/draft')
  @Roles('student')
  @HttpCode(HttpStatus.OK)
  async saveDraft(
    @CurrentUser('id') studentId: string,
    @Body() dto: SaveDraftDto,
  ) {
    return this.applicationsService.saveDraft(studentId, dto);
  }

  /**
   * POST /v1/applications/mine/submit
   * Submit the application (transitions draft → submitted).
   */
  @Post('mine/submit')
  @Roles('student')
  @HttpCode(HttpStatus.OK)
  async submitApplication(
    @CurrentUser('id') studentId: string,
    @Body() dto: SubmitApplicationDto,
  ) {
    return this.applicationsService.submitApplication(studentId, dto);
  }

  /**
   * GET /v1/applications/mine/profile
   * Get student profile data.
   */
  @Get('mine/profile')
  @Roles('student')
  async getMyProfile(@CurrentUser('id') studentId: string) {
    return this.applicationsService.getMyProfile(studentId);
  }

  /**
   * PATCH /v1/applications/mine/profile
   * Update student profile fields.
   */
  @Patch('mine/profile')
  @Roles('student')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentUser('id') studentId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.applicationsService.updateProfile(studentId, dto);
  }

  // ─── ADMIN ENDPOINTS ────────────────────────────────────────────────────────

  @Get('stats')
  @Roles('admin', 'super_admin')
  async getApplicationStats() {
    return this.applicationsService.getApplicationStats();
  }

  @Get()
  @Roles('admin', 'super_admin')
  async listApplications(
    @Query('status') status?: string,
    @Query('admissionType') admissionType?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.applicationsService.listApplications({
      status,
      admissionType,
      category,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  @Roles('admin', 'super_admin')
  async getApplicationById(@Param('id') id: string) {
    return this.applicationsService.getApplicationById(id);
  }

  @Patch(':id/review')
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  async reviewApplication(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationReviewDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.applicationsService.reviewApplication(id, dto.status, adminId, dto.notes);
  }
}
