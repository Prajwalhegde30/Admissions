import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
export declare class InvitesController {
    private readonly invitesService;
    constructor(invitesService: InvitesService);
    createInvite(dto: CreateInviteDto, adminId: string): Promise<{
        email: string;
        id: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.InviteStatus;
        expiresAt: Date;
    }>;
    bulkInvite(file: Express.Multer.File, adminId: string): Promise<{
        total: number;
        sent: number;
        failed: number;
        errors: {
            row: number;
            email: string;
            reason: string;
        }[];
    } | {
        statusCode: number;
        message: string;
    }>;
    listInvites(status?: string, page?: number, limit?: number): Promise<{
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
    acceptInvite(token: string): Promise<{
        email: string;
        firstName: string;
        lastName: string;
    }>;
    resendInvite(id: string): Promise<{
        message: string;
        expiresAt: string;
    }>;
    revokeInvite(id: string): Promise<{
        message: string;
    }>;
}
