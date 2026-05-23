"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const documents_service_1 = require("./documents.service");
const documents_controller_1 = require("./documents.controller");
const ocr_module_1 = require("../ocr/ocr.module");
const email_module_1 = require("../email/email.module");
const notifications_module_1 = require("../notifications/notifications.module");
let DocumentsModule = class DocumentsModule {
};
exports.DocumentsModule = DocumentsModule;
exports.DocumentsModule = DocumentsModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.register({
                storage: undefined,
            }),
            ocr_module_1.OcrModule,
            email_module_1.EmailModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [documents_controller_1.DocumentsController],
        providers: [documents_service_1.DocumentsService],
        exports: [documents_service_1.DocumentsService],
    })
], DocumentsModule);
//# sourceMappingURL=documents.module.js.map