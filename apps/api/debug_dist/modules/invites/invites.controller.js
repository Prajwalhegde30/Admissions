"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitesController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const invites_service_1 = require("./invites.service");
const create_invite_dto_1 = require("./dto/create-invite.dto");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let InvitesController = class InvitesController {
    constructor(invitesService) {
        this.invitesService = invitesService;
    }
    async createInvite(dto, adminId) {
        return this.invitesService.createInvite(dto, adminId);
    }
    async bulkInvite(file, adminId) {
        if (!file) {
            return {
                statusCode: 400,
                message: 'CSV file is required',
            };
        }
        return this.invitesService.bulkInvite(file.buffer, adminId);
    }
    async listInvites(status, page, limit) {
        return this.invitesService.listInvites({ status, page, limit });
    }
    async acceptInvite(token) {
        return this.invitesService.acceptInvite(token);
    }
    async resendInvite(id) {
        return this.invitesService.resendInvite(id);
    }
    async revokeInvite(id) {
        return this.invitesService.revokeInvite(id);
    }
};
exports.InvitesController = InvitesController;
tslib_1.__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [create_invite_dto_1.CreateInviteDto, String]),
    tslib_1.__metadata("design:returntype", Promise)
], InvitesController.prototype, "createInvite", null);
tslib_1.__decorate([
    (0, common_1.Post)('bulk'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    tslib_1.__param(0, (0, common_1.UploadedFile)()),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], InvitesController.prototype, "bulkInvite", null);
tslib_1.__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    tslib_1.__param(0, (0, common_1.Query)('status')),
    tslib_1.__param(1, (0, common_1.Query)('page')),
    tslib_1.__param(2, (0, common_1.Query)('limit')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Number, Number]),
    tslib_1.__metadata("design:returntype", Promise)
], InvitesController.prototype, "listInvites", null);
tslib_1.__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('accept'),
    tslib_1.__param(0, (0, common_1.Query)('token')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], InvitesController.prototype, "acceptInvite", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/resend'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    tslib_1.__param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], InvitesController.prototype, "resendInvite", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    tslib_1.__param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], InvitesController.prototype, "revokeInvite", null);
exports.InvitesController = InvitesController = tslib_1.__decorate([
    (0, common_1.Controller)('invites'),
    tslib_1.__metadata("design:paramtypes", [invites_service_1.InvitesService])
], InvitesController);
//# sourceMappingURL=invites.controller.js.map