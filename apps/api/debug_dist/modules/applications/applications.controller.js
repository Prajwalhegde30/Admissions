"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const applications_service_1 = require("./applications.service");
const save_draft_dto_1 = require("./dto/save-draft.dto");
const submit_application_dto_1 = require("./dto/submit-application.dto");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const update_application_review_dto_1 = require("./dto/update-application-review.dto");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const common_2 = require("@nestjs/common");
let ApplicationsController = class ApplicationsController {
    constructor(applicationsService) {
        this.applicationsService = applicationsService;
    }
    async getMyApplication(studentId) {
        return this.applicationsService.getMyApplication(studentId);
    }
    async saveDraft(studentId, dto) {
        return this.applicationsService.saveDraft(studentId, dto);
    }
    async submitApplication(studentId, dto) {
        return this.applicationsService.submitApplication(studentId, dto);
    }
    async getMyProfile(studentId) {
        return this.applicationsService.getMyProfile(studentId);
    }
    async updateProfile(studentId, dto) {
        return this.applicationsService.updateProfile(studentId, dto);
    }
    async getApplicationStats() {
        return this.applicationsService.getApplicationStats();
    }
    async listApplications(status, admissionType, category, search, page, limit) {
        return this.applicationsService.listApplications({
            status,
            admissionType,
            category,
            search,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });
    }
    async getApplicationById(id) {
        return this.applicationsService.getApplicationById(id);
    }
    async reviewApplication(id, dto, adminId) {
        return this.applicationsService.reviewApplication(id, dto.status, adminId, dto.notes);
    }
};
exports.ApplicationsController = ApplicationsController;
tslib_1.__decorate([
    (0, common_1.Get)('mine'),
    (0, roles_decorator_1.Roles)('student'),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getMyApplication", null);
tslib_1.__decorate([
    (0, common_1.Patch)('mine/draft'),
    (0, roles_decorator_1.Roles)('student'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, save_draft_dto_1.SaveDraftDto]),
    tslib_1.__metadata("design:returntype", Promise)
], ApplicationsController.prototype, "saveDraft", null);
tslib_1.__decorate([
    (0, common_1.Post)('mine/submit'),
    (0, roles_decorator_1.Roles)('student'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, submit_application_dto_1.SubmitApplicationDto]),
    tslib_1.__metadata("design:returntype", Promise)
], ApplicationsController.prototype, "submitApplication", null);
tslib_1.__decorate([
    (0, common_1.Get)('mine/profile'),
    (0, roles_decorator_1.Roles)('student'),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getMyProfile", null);
tslib_1.__decorate([
    (0, common_1.Patch)('mine/profile'),
    (0, roles_decorator_1.Roles)('student'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    tslib_1.__param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, update_profile_dto_1.UpdateProfileDto]),
    tslib_1.__metadata("design:returntype", Promise)
], ApplicationsController.prototype, "updateProfile", null);
tslib_1.__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getApplicationStats", null);
tslib_1.__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    tslib_1.__param(0, (0, common_2.Query)('status')),
    tslib_1.__param(1, (0, common_2.Query)('admissionType')),
    tslib_1.__param(2, (0, common_2.Query)('category')),
    tslib_1.__param(3, (0, common_2.Query)('search')),
    tslib_1.__param(4, (0, common_2.Query)('page')),
    tslib_1.__param(5, (0, common_2.Query)('limit')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String, String, Number, Number]),
    tslib_1.__metadata("design:returntype", Promise)
], ApplicationsController.prototype, "listApplications", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    tslib_1.__param(0, (0, common_2.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getApplicationById", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id/review'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    tslib_1.__param(0, (0, common_2.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, update_application_review_dto_1.UpdateApplicationReviewDto, String]),
    tslib_1.__metadata("design:returntype", Promise)
], ApplicationsController.prototype, "reviewApplication", null);
exports.ApplicationsController = ApplicationsController = tslib_1.__decorate([
    (0, common_1.Controller)('applications'),
    tslib_1.__metadata("design:paramtypes", [applications_service_1.ApplicationsService])
], ApplicationsController);
//# sourceMappingURL=applications.controller.js.map