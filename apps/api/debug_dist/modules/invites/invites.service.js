"use strict";
var InvitesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitesService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const stream_1 = require("stream");
const csv_parser_1 = tslib_1.__importDefault(require("csv-parser"));
const prisma_service_1 = require("../../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const INVITE_EXPIRY_HOURS = 72;
let InvitesService = InvitesService_1 = class InvitesService {
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.logger = new common_1.Logger(InvitesService_1.name);
    }
    async createInvite(dto, adminId) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
            select: { id: true },
        });
        if (existingUser) {
            throw new common_1.ConflictException('An account with this email already exists');
        }
        const existingInvite = await this.prisma.invite.findFirst({
            where: {
                email: dto.email,
                status: 'pending',
            },
            select: { id: true },
        });
        if (existingInvite) {
            throw new common_1.ConflictException('A pending invite already exists for this email');
        }
        const token = (0, uuid_1.v4)();
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
        this.emailService.sendInviteEmail({
            to: dto.email,
            firstName: dto.firstName,
            lastName: dto.lastName,
            inviteToken: token,
        });
        this.logger.log(`Invite created for ${dto.email} by admin ${adminId}`);
        return invite;
    }
    async bulkInvite(fileBuffer, adminId) {
        const rows = await this.parseCsv(fileBuffer);
        const results = {
            total: rows.length,
            sent: 0,
            failed: 0,
            errors: [],
        };
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNumber = i + 2;
            try {
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
                await this.createInvite({
                    firstName: row.first_name.trim(),
                    lastName: row.last_name.trim(),
                    email: row.email.trim().toLowerCase(),
                }, adminId);
                results.sent++;
            }
            catch (error) {
                results.failed++;
                results.errors.push({
                    row: rowNumber,
                    email: row.email || '',
                    reason: error instanceof common_1.ConflictException
                        ? error.getResponse().message || 'Account already exists'
                        : 'Failed to create invite',
                });
            }
        }
        this.logger.log(`Bulk invite completed: ${results.sent}/${results.total} sent, ${results.failed} failed`);
        return results;
    }
    async listInvites(params) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
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
    async resendInvite(inviteId) {
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
            throw new common_1.NotFoundException('Invite not found');
        }
        if (invite.status === 'accepted') {
            throw new common_1.BadRequestException('Cannot resend an accepted invite');
        }
        if (invite.status === 'revoked') {
            throw new common_1.BadRequestException('Cannot resend a revoked invite');
        }
        const newToken = (0, uuid_1.v4)();
        const expiresAt = new Date(Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000);
        await this.prisma.invite.update({
            where: { id: inviteId },
            data: {
                token: newToken,
                status: 'pending',
                expiresAt,
            },
        });
        this.emailService.sendInviteEmail({
            to: invite.email,
            firstName: invite.firstName,
            lastName: invite.lastName,
            inviteToken: newToken,
        });
        this.logger.log(`Invite resent to ${invite.email}`);
        return { message: 'Invite resent', expiresAt: expiresAt.toISOString() };
    }
    async revokeInvite(inviteId) {
        const invite = await this.prisma.invite.findUnique({
            where: { id: inviteId },
            select: { id: true, status: true },
        });
        if (!invite) {
            throw new common_1.NotFoundException('Invite not found');
        }
        if (invite.status === 'accepted') {
            throw new common_1.BadRequestException('Cannot revoke an accepted invite');
        }
        await this.prisma.invite.update({
            where: { id: inviteId },
            data: { status: 'revoked' },
        });
        this.logger.log(`Invite ${inviteId} revoked`);
        return { message: 'Invite revoked' };
    }
    async acceptInvite(token) {
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
            throw new common_1.BadRequestException('Invalid invite token');
        }
        if (invite.status !== 'pending') {
            throw new common_1.BadRequestException('Invite token has already been used or revoked');
        }
        if (new Date() > invite.expiresAt) {
            await this.prisma.invite.update({
                where: { id: invite.id },
                data: { status: 'expired' },
            });
            throw new common_1.BadRequestException('Invite token has expired');
        }
        return {
            email: invite.email,
            firstName: invite.firstName,
            lastName: invite.lastName,
        };
    }
    parseCsv(buffer) {
        return new Promise((resolve, reject) => {
            const results = [];
            const stream = stream_1.Readable.from(buffer.toString());
            stream
                .pipe((0, csv_parser_1.default)())
                .on('data', (data) => results.push(data))
                .on('end', () => resolve(results))
                .on('error', (err) => reject(err));
        });
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
};
exports.InvitesService = InvitesService;
exports.InvitesService = InvitesService = InvitesService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], InvitesService);
//# sourceMappingURL=invites.service.js.map