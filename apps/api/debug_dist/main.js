"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const path = tslib_1.__importStar(require("path"));
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('API_PORT', 3001);
    app.setGlobalPrefix('v1');
    app.useStaticAssets(path.resolve(process.cwd(), 'uploads'), {
        prefix: '/v1/files/',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new http_exception_filter_1.GlobalExceptionFilter());
    app.enableCors({
        origin: [
            configService.get('STUDENT_PORTAL_URL', 'http://localhost:3000'),
            configService.get('ADMIN_PORTAL_URL', 'http://localhost:3002'),
        ],
        credentials: true,
    });
    await app.listen(port);
    logger.log(`API running on http://localhost:${port}/v1`);
}
bootstrap();
//# sourceMappingURL=main.js.map