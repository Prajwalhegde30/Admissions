import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';
import csvParser from 'csv-parser';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateInviteDto } from './dto/create-invite.dto';

const INVITE_EXPIRY_HOURS = 72;

@Injectable()
export class InvitesService {
  private readonly logger = new Logger(InvitesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * POST /invites — Create a single invite
   */
  async createInvite(dto: CreateInviteDto, adminId: string) {
    // Check if email already has an active invite or existing account
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const existingInvite = await this.prisma.invite.findFirst({
      where: {
        email: dto.email,
        status: 'pending',
      },
      select: { id: true },
    });

    if (existingInvite) {
      throw new ConflictException('A pending invite already exists for this email');
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000);

    const invite = await this.prisma.invite.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        token,
        status: 'pending',
        createdBy: adminId,
        expiresAt,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    // Send invite email (non-blocking)
    this.emailService.sendInviteEmail({
      to: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      inviteToken: token,
    });

    this.logger.log(`Invite created for ${dto.email} by admin ${adminId}`);

    return invite;
  }

  /**
   * POST /invites/bulk — Bulk invite from CSV
   */
  async bulkInvite(fileBuffer: Buffer, adminId: string) {
    const rows = await this.parseCsv(fileBuffer);
    const results = {
      total: rows.length,
      sent: 0,
      failed: 0,
      errors: [] as { row: number; email: string; reason: string }[],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 for 1-indexed + header row

      try {
        // Validate row
        if (!row.email || !this.isValidEmail(row.email)) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            email: row.email || '',
            reason: 'Invalid email format',
          });
          continue;
        }

        if (!row.first_name || !row.last_name) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            email: row.email,
            reason: 'Missing first_name or last_name',
          });
          continue;
        }

        // Create invite (reuse single invite logic)
        await this.createInvite(
          {
            firstName: row.first_name.trim(),
            lastName: row.last_name.trim(),
            email: row.email.trim().toLowerCase(),
          },
          adminId,
        );

        results.sent++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: rowNumber,
          email: row.email || '',
          reason: error instanceof ConflictException
            ? (error.getResponse() as { message: string }).message || 'Account already exists'
            : 'Failed to create invite',
        });
      }
    }

    this.logger.log(
      `Bulk invite completed: ${results.sent}/${results.total} sent, ${results.failed} failed`,
    );

    return results;
  }

  /**
   * GET /invites — List all invites with filters
   */
  async listInvites(params: { status?: string; page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (params.status) {
      where.status = params.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.invite.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          status: true,
          expiresAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.invite.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /**
   * POST /invites/:id/resend — Resend an invite (resets expiry)
   */
  async resendInvite(inviteId: string) {
    const invite = await this.prisma.invite.findUnique({
      where: { id: inviteId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        token: true,
        status: true,
      },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.status === 'accepted') {
      throw new BadRequestException('Cannot resend an accepted invite');
    }

    if (invite.status === 'revoked') {
      throw new BadRequestException('Cannot resend a revoked invite');
    }

    // Generate new token and reset expiry
    const newToken = uuidv4();
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000);

    await this.prisma.invite.update({
      where: { id: inviteId },
      data: {
        token: newToken,
        status: 'pending',
        expiresAt,
      },
    });

    // Send invite email
    this.emailService.sendInviteEmail({
      to: invite.email,
      firstName: invite.firstName,
      lastName: invite.lastName,
      inviteToken: newToken,
    });

    this.logger.log(`Invite resent to ${invite.email}`);

    return { message: 'Invite resent', expiresAt: expiresAt.toISOString() };
  }

  /**
   * DELETE /invites/:id — Revoke an invite
   */
  async revokeInvite(inviteId: string) {
    const invite = await this.prisma.invite.findUnique({
      where: { id: inviteId },
      select: { id: true, status: true },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.status === 'accepted') {
      throw new BadRequestException('Cannot revoke an accepted invite');
    }

    await this.prisma.invite.update({
      where: { id: inviteId },
      data: { status: 'revoked' },
    });

    this.logger.log(`Invite ${inviteId} revoked`);

    return { message: 'Invite revoked' };
  }

  /**
   * GET /invites/accept — Validate invite token (public endpoint)
   */
  async acceptInvite(token: string) {
    const invite = await this.prisma.invite.findUnique({
      where: { token },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        expiresAt: true,
      },
    });

    if (!invite) {
      throw new BadRequestException('Invalid invite token');
    }

    if (invite.status !== 'pending') {
      throw new BadRequestException('Invite token has already been used or revoked');
    }

    if (new Date() > invite.expiresAt) {
      await this.prisma.invite.update({
        where: { id: invite.id },
        data: { status: 'expired' },
      });
      throw new BadRequestException('Invite token has expired');
    }

    return {
      email: invite.email,
      firstName: invite.firstName,
      lastName: invite.lastName,
    };
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private parseCsv(buffer: Buffer): Promise<Record<string, string>[]> {
    return new Promise((resolve, reject) => {
      const results: Record<string, string>[] = [];
      const stream = Readable.from(buffer.toString());

      stream
        .pipe(csvParser())
        .on('data', (data: Record<string, string>) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (err: Error) => reject(err));
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
