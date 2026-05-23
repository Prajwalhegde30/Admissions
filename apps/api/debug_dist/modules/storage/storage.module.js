"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const storage_service_1 = require("./storage.service");
let StorageModule = class StorageModule {
};
exports.StorageModule = StorageModule;
exports.StorageModule = StorageModule = tslib_1.__decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [storage_service_1.StorageService],
        exports: [storage_service_1.StorageService],
    })
], StorageModule);
//# sourceMappingURL=storage.module.js.map