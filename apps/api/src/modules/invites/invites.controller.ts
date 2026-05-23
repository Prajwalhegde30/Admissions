import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  /**
   * POST /v1/invites — Create a single invite (Admin only)
   */
  @Post()
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.CREATED)
  async createInvite(
    @Body() dto: CreateInviteDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.invitesService.createInvite(dto, adminId);
  }

  /**
   * POST /v1/invites/bulk — Bulk invite from CSV (Admin only)
   */
  @Post('bulk')
  @Roles('admin', 'super_admin')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async bulkInvite(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') adminId: string,
  ) {
    if (!file) {
      return {
        statusCode: 400,
        message: 'CSV file is required',
      };
    }
    return this.invitesService.bulkInvite(file.buffer, adminId);
  }

  /**
   * GET /v1/invites — List all invites with filters (Admin only)
   */
  @Get()
  @Roles('admin', 'super_admin')
  async listInvites(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.invitesService.listInvites({ status, page, limit });
  }

  /**
   * GET /v1/invites/accept — Validate invite token (Public)
   * Student clicks link in email → this validates the token.
   */
  @Public()
  @Get('accept')
  async acceptInvite(@Query('token') token: string) {
    return this.invitesService.acceptInvite(token);
  }

  /**
   * POST /v1/invites/:id/resend — Resend an invite (Admin only)
   */
  @Post(':id/resend')
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  async resendInvite(@Param('id', ParseUUIDPipe) id: string) {
    return this.invitesService.resendInvite(id);
  }

  /**
   * DELETE /v1/invites/:id — Revoke an invite (Admin only)
   */
  @Delete(':id')
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  async revokeInvite(@Param('id', ParseUUIDPipe) id: string) {
    return this.invitesService.revokeInvite(id);
  }
}
