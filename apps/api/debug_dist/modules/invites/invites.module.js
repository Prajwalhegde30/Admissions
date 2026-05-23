"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitesModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const invites_service_1 = require("./invites.service");
const invites_controller_1 = require("./invites.controller");
let InvitesModule = class InvitesModule {
};
exports.InvitesModule = InvitesModule;
exports.InvitesModule = InvitesModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.register({
                limits: {
                    fileSize: 10 * 1024 * 1024,
                },
            }),
        ],
        controllers: [invites_controller_1.InvitesController],
        providers: [invites_service_1.InvitesService],
        exports: [invites_service_1.InvitesService],
    })
], InvitesModule);
//# sourceMappingURL=invites.module.js.map