"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const documents_service_1 = require("./documents.service");
const confirm_ocr_dto_1 = require("./dto/confirm-ocr.dto");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let DocumentsController = class DocumentsController {
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    async uploadDocument(studentId, file, applicationId, documentType) {
        return this.documentsService.uploadDocument(studentId, applicationId, documentType, file);
    }
    async getMyDocuments(studentId) {
        return this.documentsService.getMyDocuments(studentId);
    }
    async getOcrResults(studentId, documentId) {
        return this.documentsService.getOcrResults(studentId, documentId);
    }
    async getDocumentUrl(userId, role, documentId) {
        return this.documentsService.getDocumentUrl(userId, documentId, role);
    }
    async confirmOcr(studentId, documentId, dto) {
        return this.documentsService.confirmOcr(studentId, documentId, dto.confirmedData);
    }
    async deleteDocument(studentId, documentId) {
        return this.documentsService.deleteDocument(studentId, documentId);
    }
    async verifyDocument(documentId, adminId) {
        return this.documentsService.verifyDocument(documentId, adminId);
    }
    async rejectDocument(documentId, adminId, reason) {
        return this.documentsService.rejectDocument(documentId, adminId, reason);
    }
};
exports.DocumentsController = DocumentsController;
tslib_1.__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('student'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    tslib_1.__param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf)$/i }),
        ],
    }))),
    tslib_1.__param(2, (0, common_1.Body)('applicationId')),
    tslib_1.__param(3, (0, common_1.Body)('documentType')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], DocumentsController.prototype, "uploadDocument", null);
tslib_1.__decorate([
    (0, common_1.Get)('mine'),
    (0, roles_decorator_1.Roles)('student'),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], DocumentsController.prototype, "getMyDocuments", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id/ocr'),
    (0, roles_decorator_1.Roles)('student'),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    tslib_1.__param(1, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], DocumentsController.prototype, "getOcrResults", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id/url'),
    (0, roles_decorator_1.Roles)('student', 'admin', 'super_admin'),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)('role')),
    tslib_1.__param(2, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], DocumentsController.prototype, "getDocumentUrl", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id/confirm-ocr'),
    (0, roles_decorator_1.Roles)('student'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    tslib_1.__param(1, (0, common_1.Param)('id')),
    tslib_1.__param(2, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, confirm_ocr_dto_1.ConfirmOcrDto]),
    tslib_1.__metadata("design:returntype", Promise)
], DocumentsController.prototype, "confirmOcr", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('student'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    tslib_1.__param(1, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], DocumentsController.prototype, "deleteDocument", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id/verify'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], DocumentsController.prototype, "verifyDocument", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id/reject'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    tslib_1.__param(2, (0, common_1.Body)('reason')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], DocumentsController.prototype, "rejectDocument", null);
exports.DocumentsController = DocumentsController = tslib_1.__decorate([
    (0, common_1.Controller)('documents'),
    tslib_1.__metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map