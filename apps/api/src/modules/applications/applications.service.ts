import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SaveDraftDto } from './dto/save-draft.dto';
import { SubmitApplicationDto } from './dto/submit-application.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private parseFormData(raw: string | null): Record<string, unknown> {
    if (!raw) return {};
    try { return JSON.parse(raw); } catch { return {}; }
  }

  /**
   * GET /applications/mine — Get or create the student's application
   */
  async getMyApplication(studentId: string) {
    let application = await this.prisma.application.findUnique({
      where: { studentId },
    });

    // Auto-create if no application exists yet
    if (!application) {
      const profile = await this.prisma.studentProfile.findUnique({
        where: { userId: studentId },
        select: { admissionType: true, category: true },
      });

      application = await this.prisma.application.create({
        data: {
          studentId,
          admissionType: profile?.admissionType || 'kcet',
          category: profile?.category || 'general',
          status: 'draft',
          formData: '{}',
        },
      });

      this.logger.log(`Created new application for student ${studentId}`);
    }

    return {
      ...application,
      formData: this.parseFormData(application.formData),
    };
  }

  /**
   * PATCH /applications/mine/draft — Auto-save form fields
   */
  async saveDraft(studentId: string, dto: SaveDraftDto) {
    const application = await this.prisma.application.findUnique({
      where: { studentId },
      select: { id: true, status: true, formData: true },
    });

    if (!application) {
      throw new NotFoundException('No application found. Please access your application first.');
    }

    if (application.status !== 'draft') {
      throw new BadRequestException('Cannot modify a submitted application');
    }

    // Build the updated formData
    const currentData = this.parseFormData(application.formData);

    if (dto.fields && dto.fields.length > 0) {
      // Batch update
      for (const field of dto.fields) {
        this.setNestedValue(currentData, field.fieldPath, field.value);
      }
    } else if (dto.fieldPath) {
      // Single field update
      this.setNestedValue(currentData, dto.fieldPath, dto.value);
    } else {
      throw new BadRequestException('Either fieldPath or fields[] is required');
    }

    await this.prisma.application.update({
      where: { id: application.id },
      data: { formData: JSON.stringify(currentData) },
    });

    return { savedAt: new Date().toISOString() };
  }

  /**
   * POST /applications/mine/submit — Submit the application
   */
  async submitApplication(studentId: string, dto: SubmitApplicationDto) {
    const application = await this.prisma.application.findUnique({
      where: { studentId },
      select: {
        id: true,
        status: true,
        formData: true,
      },
    });

    if (!application) {
      throw new NotFoundException('No application found');
    }

    if (application.status !== 'draft') {
      throw new BadRequestException('Application has already been submitted');
    }

    // Update admission type + category, then submit
    const result = await this.prisma.application.update({
      where: { id: application.id },
      data: {
        admissionType: dto.admissionType,
        category: dto.category,
        status: 'payment_pending',
        submittedAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        submittedAt: true,
      },
    });

    // Also update the student profile
    await this.prisma.studentProfile.update({
      where: { userId: studentId },
      data: {
        admissionType: dto.admissionType,
        category: dto.category,
      },
    });

    this.logger.log(`Application ${result.id} submitted by student ${studentId}`);

    const student = await this.prisma.user.findUnique({ where: { id: studentId } });
    if (student) {
      await this.notificationsService.createNotification(
        studentId,
        'application_submitted',
        'Application Received',
        'Your application has been received. Please proceed to pay the application fee to start the review process.'
      );
      await this.emailService.sendNotificationEmail({
        to: student.email,
        subject: 'Application Received - Payment Required',
        heading: 'Action Required: Payment',
        body: 'Your admission application has been received. Please log in to the portal and pay the application fee to move your application to the review stage.'
      });
    }

    return result;
  }

  /**
   * GET /applications/mine/profile — Get student profile
   */
  async getMyProfile(studentId: string) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId: studentId },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Student profile not found');
    }

    return profile;
  }

  /**
   * PATCH /applications/mine/profile — Update student profile
   */
  async updateProfile(studentId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId: studentId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Student profile not found');
    }

    // Build update data — only include fields that are provided
    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined && value !== null) {
        if (key === 'dateOfBirth') {
          updateData[key] = new Date(value as string);
        } else {
          updateData[key] = value;
        }
      }
    }

    const updated = await this.prisma.studentProfile.update({
      where: { userId: studentId },
      data: updateData,
    });

    return updated;
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown) {
    const keys = path.split('.');
    let current: Record<string, unknown> = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
        current[keys[i]] = {};
      }
      current = current[keys[i]] as Record<string, unknown>;
    }

    current[keys[keys.length - 1]] = value;
  }

  // ─── ADMIN ENDPOINTS ────────────────────────────────────────────────────────

  /**
   * GET /applications/stats
   */
  async getApplicationStats() {
    const counts = await this.prisma.application.groupBy({
      by: ['status'],
      _count: true,
    });

    const result: Record<string, number> = {
      draft: 0,
      payment_pending: 0,
      paid: 0,
      submitted: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      correction_requested: 0,
      total: 0,
    };

    for (const group of counts) {
      result[group.status] = group._count;
      result.total += group._count;
    }

    return result;
  }

  /**
   * GET /applications
   */
  async listApplications(filters: {
    status?: string;
    admissionType?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, admissionType, category, search, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (admissionType) where.admissionType = admissionType;
    if (category) where.category = category;
    if (search) {
      where.student = {
        OR: [
          { email: { contains: search } },
          { firstName: { contains: search } },
          { lastName: { contains: search } },
        ],
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          student: { select: { email: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.application.count({ where }),
    ]);

    // Parse formData for each item
    const data = items.map(item => ({
      ...item,
      formData: this.parseFormData(item.formData),
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * GET /applications/:id
   */
  async getApplicationById(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        student: {
          select: { email: true, firstName: true, lastName: true },
        },
        documents: true,
        correctionRequests: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId: application.studentId },
    });

    const validationWarnings: string[] = [];
    
    // Cross-document validation
    const docs = application.documents || [];
    const parseDocOcr = (d: any) => {
      if (!d?.ocrConfirmed) return null;
      try { return typeof d.ocrConfirmed === 'string' ? JSON.parse(d.ocrConfirmed) : d.ocrConfirmed; } catch { return null; }
    };
    const tenthDoc = parseDocOcr(docs.find(d => d.documentType === 'marks_card_10th'));
    const twelfthDoc = parseDocOcr(docs.find(d => d.documentType === 'marks_card_12th'));
    const aadhaarDoc = parseDocOcr(docs.find(d => d.documentType === 'aadhaar'));

    const names = new Set<string>();
    const dobs = new Set<string>();

    if (tenthDoc?.fullName) names.add(tenthDoc.fullName.toUpperCase().trim());
    if (twelfthDoc?.fullName) names.add(twelfthDoc.fullName.toUpperCase().trim());
    if (aadhaarDoc?.fullName) names.add(aadhaarDoc.fullName.toUpperCase().trim());

    if (tenthDoc?.dateOfBirth) dobs.add(tenthDoc.dateOfBirth.trim());
    if (twelfthDoc?.dateOfBirth) dobs.add(twelfthDoc.dateOfBirth.trim());
    if (aadhaarDoc?.dateOfBirth) dobs.add(aadhaarDoc.dateOfBirth.trim());

    if (names.size > 1) {
      validationWarnings.push('Name mismatch detected across uploaded documents.');
    }
    if (dobs.size > 1) {
      validationWarnings.push('Date of Birth mismatch detected across uploaded documents.');
    }

    return {
      ...application,
      formData: this.parseFormData(application.formData),
      profile,
      validationWarnings,
    };
  }

  /**
   * PATCH /applications/:id/review
   */
  async reviewApplication(
    id: string,
    status: 'approved' | 'rejected',
    adminId: string,
    notes?: string,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: {
        status,
        adminNotes: notes,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });

    this.logger.log(`Application ${id} reviewed by ${adminId}: ${status}`);

    const student = await this.prisma.user.findUnique({ where: { id: application.studentId } });
    if (student) {
      const isApproved = status === 'approved';
      await this.notificationsService.createNotification(
        student.id,
        isApproved ? 'application_approved' : 'application_rejected',
        `Application ${isApproved ? 'Approved' : 'Rejected'}`,
        isApproved 
          ? 'Congratulations! Your admission application has been approved.'
          : 'Your admission application has been rejected. Please contact the admissions office.'
      );
      await this.emailService.sendNotificationEmail({
        to: student.email,
        subject: `Application ${isApproved ? 'Approved' : 'Rejected'}`,
        heading: `Application ${isApproved ? 'Approved' : 'Rejected'}`,
        body: isApproved 
          ? 'Congratulations! Your admission application has been approved by the admissions office.'
          : `Your admission application has been rejected.<br/><br/>Notes: ${notes || 'No reason provided.'}`
      });
    }

    return updated;
  }
}
