import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private readonly configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    sendInviteEmail(params: {
        to: string;
        firstName: string;
        lastName: string;
        inviteToken: string;
    }): Promise<void>;
    sendNotificationEmail(params: {
        to: string;
        subject: string;
        heading: string;
        body: string;
    }): Promise<void>;
}
