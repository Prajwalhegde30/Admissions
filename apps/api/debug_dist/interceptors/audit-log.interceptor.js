"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogInterceptor = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../prisma/prisma.service");
let AuditLogInterceptor = class AuditLogInterceptor {
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        return next.handle().pipe((0, operators_1.tap)(() => {
            this.logAction(context, request).catch(err => {
                console.error('Failed to write audit log:', err);
            });
        }));
    }
    async logAction(context, request) {
        const roles = this.reflector.get('roles', context.getHandler());
        if (!roles || (!roles.includes('admin') && !roles.includes('super_admin'))) {
            return;
        }
        const user = request.user;
        if (!user)
            return;
        const method = request.method;
        if (method === 'GET')
            return;
        let entityType = null;
        let entityId = null;
        const path = request.path;
        if (path.includes('/applications/')) {
            entityType = 'application';
            entityId = request.params.id;
        }
        else if (path.includes('/documents/')) {
            entityType = 'document';
            entityId = request.params.id;
        }
        else if (path.includes('/invites')) {
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
                metadata: {
                    body: this.sanitizeBody(request.body),
                    query: request.query,
                },
            },
        });
    }
    sanitizeBody(body) {
        if (!body)
            return {};
        const sanitized = { ...body };
        if (sanitized.password)
            sanitized.password = '[REDACTED]';
        return sanitized;
    }
};
exports.AuditLogInterceptor = AuditLogInterceptor;
exports.AuditLogInterceptor = AuditLogInterceptor = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], AuditLogInterceptor);
//# sourceMappingURL=audit-log.interceptor.js.map