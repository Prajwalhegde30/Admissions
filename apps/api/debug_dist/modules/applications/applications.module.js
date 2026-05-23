"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const applications_service_1 = require("./applications.service");
const applications_controller_1 = require("./applications.controller");
const email_module_1 = require("../email/email.module");
const notifications_module_1 = require("../notifications/notifications.module");
let ApplicationsModule = class ApplicationsModule {
};
exports.ApplicationsModule = ApplicationsModule;
exports.ApplicationsModule = ApplicationsModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [email_module_1.EmailModule, notifications_module_1.NotificationsModule],
        controllers: [applications_controller_1.ApplicationsController],
        providers: [applications_service_1.ApplicationsService],
        exports: [applications_service_1.ApplicationsService],
    })
], ApplicationsModule);
//# sourceMappingURL=applications.module.js.map