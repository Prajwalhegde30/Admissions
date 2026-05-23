import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify SMTP connection on startup
    this.transporter.verify().then(() => {
      this.logger.log('SMTP connection established successfully');
    }).catch((err) => {
      this.logger.warn(`SMTP connection failed: ${err.message}. Emails will not be sent.`);
    });
  }

  /**
   * Send an invite email to a student with their registration link.
   */
  async sendInviteEmail(params: {
    to: string;
    firstName: string;
    lastName: string;
    inviteToken: string;
  }): Promise<void> {
    const studentPortalUrl = process.env.STUDENT_PORTAL_URL || 'http://localhost:3000';
    const registrationLink = `${studentPortalUrl}/set-password?token=${params.inviteToken}`;

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Atria Admissions" <${process.env.SMTP_USER}>`,
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
    } catch (error) {
      this.logger.error(`Failed to send invite email to ${params.to}: ${(error as Error).message}`);
      // Don't throw — email failure shouldn't block invite creation
    }
  }

  /**
   * Send a notification email (generic template for various notification types).
   */
  async sendNotificationEmail(params: {
    to: string;
    subject: string;
    heading: string;
    body: string;
  }): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Atria Admissions" <${process.env.SMTP_USER}>`,
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
    } catch (error) {
      this.logger.error(
        `Failed to send notification email to ${params.to}: ${(error as Error).message}`,
      );
    }
  }
}
