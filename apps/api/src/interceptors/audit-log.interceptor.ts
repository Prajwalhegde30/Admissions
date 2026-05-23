import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    return next.handle().pipe(
      tap(() => {
        this.logAction(context, request).catch(err => {
          console.error('Failed to write audit log:', err);
        });
      }),
    );
  }

  private async logAction(context: ExecutionContext, request: any) {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    
    if (!roles || (!roles.includes('admin') && !roles.includes('super_admin'))) {
      return;
    }

    const user = request.user;
    if (!user) return;

    const method = request.method;
    if (method === 'GET') return;

    let entityType = null;
    let entityId = null;

    const path = request.path;
    if (path.includes('/applications/')) {
      entityType = 'application';
      entityId = request.params.id;
    } else if (path.includes('/documents/')) {
      entityType = 'document';
      entityId = request.params.id;
    } else if (path.includes('/invites')) {
      entityType = 'invite';
      entityId = request.params.id || null;
    }

    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorRole: user.role,
        action: `${method} ${path}`,
        entityType,
        entityId,
        ipAddress: request.ip,
        metadata: JSON.stringify({
          body: this.sanitizeBody(request.body),
          query: request.query,
        }),
      },
    });
  }

  private sanitizeBody(body: any) {
    if (!body) return {};
    const sanitized = { ...body };
    if (sanitized.password) sanitized.password = '[REDACTED]';
    return sanitized;
  }
}
