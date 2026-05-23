import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateInviteDto } from './dto/create-invite.dto';
export declare class InvitesService {
    private readonly prisma;
    private readonly emailService;
    private readonly logger;
    constructor(prisma: PrismaService, emailService: EmailService);
    createInvite(dto: CreateInviteDto, adminId: string): Promise<{
        email: string;
        id: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.InviteStatus;
        expiresAt: Date;
    }>;
    bulkInvite(fileBuffer: Buffer, adminId: string): Promise<{
        total: number;
        sent: number;
        failed: number;
        errors: {
            row: number;
            email: string;
            reason: string;
        }[];
    }>;
    listInvites(params: {
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
            createdAt: Date;
            status: import("@prisma/client").$Enums.InviteStatus;
            expiresAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    resendInvite(inviteId: string): Promise<{
        message: string;
        expiresAt: string;
    }>;
    revokeInvite(inviteId: string): Promise<{
        message: string;
    }>;
    acceptInvite(token: string): Promise<{
        email: string;
        firstName: string;
        lastName: string;
    }>;
    private parseCsv;
    private isValidEmail;
}
