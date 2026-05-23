"use strict";
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = tslib_1.__importStar(require("nodemailer"));
let EmailService = EmailService_1 = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
            port: this.configService.get('SMTP_PORT', 587),
            secure: false,
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS'),
            },
        });
        this.transporter.verify().then(() => {
            this.logger.log('SMTP connection established successfully');
        }).catch((err) => {
            this.logger.warn(`SMTP connection failed: ${err.message}. Emails will not be sent.`);
        });
    }
    async sendInviteEmail(params) {
        const studentPortalUrl = this.configService.get('STUDENT_PORTAL_URL', 'http://localhost:3000');
        const registrationLink = `${studentPortalUrl}/set-password?token=${params.inviteToken}`;
        const mailOptions = {
            from: `"Atria Admissions" <${this.configService.get('SMTP_USER')}>`,
            to: params.to,
            subject: 'Atria Institute of Technology — Your Admission Portal Invite',
            html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1a2744; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Atria Institute of Technology</h1>
            <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 14px;">Admission Portal</p>
          </div>
          
          <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
            <p style="color: #334155; font-size: 16px; margin-top: 0;">
              Dear <strong>${params.firstName} ${params.lastName}</strong>,
            </p>
            
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">
              You have been invited to complete your admission application at Atria Institute of Technology. 
              Please click the button below to set up your password and begin your application.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${registrationLink}" 
                 style="background: #2563eb; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block;">
                Set Up Your Account
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 12px; line-height: 1.6;">
              This link will expire in <strong>72 hours</strong>. If you did not expect this invitation, 
              please ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            
            <p style="color: #94a3b8; font-size: 11px; margin-bottom: 0;">
              If the button doesn't work, copy and paste this link into your browser:<br />
              <a href="${registrationLink}" style="color: #2563eb; word-break: break-all;">${registrationLink}</a>
            </p>
          </div>
          
          <div style="background: #f8fafc; padding: 16px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none;">
            <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
              Atria Institute of Technology, Bangalore &bull; Admission Office
            </p>
          </div>
        </div>
      `,
        };
        try {
            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Invite email sent to ${params.to} (messageId: ${info.messageId})`);
        }
        catch (error) {
            this.logger.error(`Failed to send invite email to ${params.to}: ${error.message}`);
        }
    }
    async sendNotificationEmail(params) {
        const mailOptions = {
            from: `"Atria Admissions" <${this.configService.get('SMTP_USER')}>`,
            to: params.to,
            subject: params.subject,
            html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1a2744; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Atria Institute of Technology</h1>
            <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 14px;">Admission Portal</p>
          </div>
          
          <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
            <h2 style="color: #1a2744; font-size: 18px; margin-top: 0;">${params.heading}</h2>
            <div style="color: #475569; font-size: 14px; line-height: 1.6;">
              ${params.body}
            </div>
          </div>
          
          <div style="background: #f8fafc; padding: 16px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none;">
            <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
              Atria Institute of Technology, Bangalore &bull; Admission Office
            </p>
          </div>
        </div>
      `,
        };
        try {
            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Notification email sent to ${params.to} (messageId: ${info.messageId})`);
        }
        catch (error) {
            this.logger.error(`Failed to send notification email to ${params.to}: ${error.message}`);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map