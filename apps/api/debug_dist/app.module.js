"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const bull_1 = require("@nestjs/bull");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const invites_module_1 = require("./modules/invites/invites.module");
const email_module_1 = require("./modules/email/email.module");
const applications_module_1 = require("./modules/applications/applications.module");
const storage_module_1 = require("./modules/storage/storage.module");
const documents_module_1 = require("./modules/documents/documents.module");
const ocr_module_1 = require("./modules/ocr/ocr.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const payments_module_1 = require("./modules/payments/payments.module");
const pdf_module_1 = require("./modules/pdf/pdf.module");
const reports_module_1 = require("./modules/reports/reports.module");
const audit_log_interceptor_1 = require("./interceptors/audit-log.interceptor");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env', '../../.env'],
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            bull_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    redis: config.get('REDIS_URL', 'redis://localhost:6379'),
                }),
            }),
            prisma_module_1.PrismaModule,
            storage_module_1.StorageModule,
            auth_module_1.AuthModule,
            invites_module_1.InvitesModule,
            email_module_1.EmailModule,
            applications_module_1.ApplicationsModule,
            documents_module_1.DocumentsModule,
            ocr_module_1.OcrModule,
            notifications_module_1.NotificationsModule,
            payments_module_1.PaymentsModule,
            pdf_module_1.PdfModule,
            reports_module_1.ReportsModule,
        ],
        providers: [
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: audit_log_interceptor_1.AuditLogInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map