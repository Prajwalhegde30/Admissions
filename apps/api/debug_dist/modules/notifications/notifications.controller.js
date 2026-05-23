"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("./notifications.service");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let NotificationsController = class NotificationsController {
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async getMyNotifications(userId) {
        return this.notificationsService.getMyNotifications(userId);
    }
    async markAsRead(userId, notificationId) {
        return this.notificationsService.markAsRead(userId, notificationId);
    }
};
exports.NotificationsController = NotificationsController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('student', 'admin', 'super_admin'),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], NotificationsController.prototype, "getMyNotifications", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, roles_decorator_1.Roles)('student', 'admin', 'super_admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    tslib_1.__param(1, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAsRead", null);
exports.NotificationsController = NotificationsController = tslib_1.__decorate([
    (0, common_1.Controller)('notifications'),
    tslib_1.__metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map