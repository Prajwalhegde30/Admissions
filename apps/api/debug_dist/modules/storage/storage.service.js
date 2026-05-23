"use strict";
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const fs = tslib_1.__importStar(require("fs"));
const path = tslib_1.__importStar(require("path"));
let StorageService = StorageService_1 = class StorageService {
    constructor() {
        this.logger = new common_1.Logger(StorageService_1.name);
        this.uploadDir = path.resolve(process.cwd(), 'uploads');
        this.ensureDir(this.uploadDir);
    }
    async upload(file, subPath) {
        const dir = path.join(this.uploadDir, path.dirname(subPath));
        this.ensureDir(dir);
        const filePath = path.join(this.uploadDir, subPath);
        fs.writeFileSync(filePath, file.buffer);
        this.logger.log(`Stored file: ${subPath} (${file.size} bytes)`);
        return subPath;
    }
    getUrl(storagePath) {
        return `/v1/files/${storagePath}`;
    }
    getAbsolutePath(storagePath) {
        return path.join(this.uploadDir, storagePath);
    }
    async delete(storagePath) {
        const filePath = path.join(this.uploadDir, storagePath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            this.logger.log(`Deleted file: ${storagePath}`);
        }
    }
    ensureDir(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [])
], StorageService);
//# sourceMappingURL=storage.service.js.map