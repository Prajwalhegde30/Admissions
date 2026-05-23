"use strict";
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = tslib_1.__importStar(require("bcryptjs"));
const crypto_1 = require("crypto");
const uuid_1 = require("uuid");
const prisma_service_1 = require("../../prisma/prisma.service");
const BCRYPT_COST_FACTOR = 12;
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            select: {
                id: true,
                email: true,
                passwordHash: true,
                role: true,
                firstName: true,
                lastName: true,
                isActive: true,
                mustChangePassword: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account has been deactivated');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        this.logger.log(`User logged in: ${user.email} (role: ${user.role})`);
        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                mustChangePassword: user.mustChangePassword,
            },
        };
    }
    async setPassword(dto) {
        if (dto.password !== dto.confirmPassword) {
            throw new common_1.BadRequestException('Passwords do not match');
        }
        const invite = await this.prisma.invite.findUnique({
            where: { token: dto.inviteToken },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                status: true,
                expiresAt: true,
            },
        });
        if (!invite) {
            throw new common_1.BadRequestException('Invalid invite token');
        }
        if (invite.status !== 'pending') {
            throw new common_1.BadRequestException('Invite token has already been used');
        }
        if (new Date() > invite.expiresAt) {
            await this.prisma.invite.update({
                where: { id: invite.id },
                data: { status: 'expired' },
            });
            throw new common_1.BadRequestException('Invite token has expired. Please contact admin for a new invite.');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: invite.email },
            select: { id: true },
        });
        if (existingUser) {
            throw new common_1.ConflictException('An account with this email already exists');
        }
        const passwordHash = await bcrypt.hash(dto.password, BCRYPT_COST_FACTOR);
        const result = await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: invite.email,
                    passwordHash,
                    role: 'student',
                    firstName: invite.firstName,
                    lastName: invite.lastName,
                    isActive: true,
                    mustChangePassword: false,
                    lastLoginAt: new Date(),
                },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    firstName: true,
                    lastName: true,
                    mustChangePassword: true,
                },
            });
            await tx.studentProfile.create({
                data: {
                    userId: user.id,
                },
            });
            await tx.invite.update({
                where: { id: invite.id },
                data: {
                    status: 'accepted',
                    studentId: user.id,
                    acceptedAt: new Date(),
                },
            });
            return user;
        });
        const tokens = await this.generateTokens(result.id, result.email, result.role);
        this.logger.log(`Student account created via invite: ${result.email}`);
        return {
            ...tokens,
            user: {
                id: result.id,
                email: result.email,
                firstName: result.firstName,
                lastName: result.lastName,
                role: result.role,
                mustChangePassword: result.mustChangePassword,
            },
        };
    }
    async refreshToken(dto) {
        const tokenHash = this.hashToken(dto.refreshToken);
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { tokenHash },
            select: {
                id: true,
                userId: true,
                expiresAt: true,
                revokedAt: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        isActive: true,
                    },
                },
            },
        });
        if (!storedToken) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (storedToken.revokedAt) {
            throw new common_1.UnauthorizedException('Refresh token has been revoked');
        }
        if (new Date() > storedToken.expiresAt) {
            throw new common_1.UnauthorizedException('Refresh token has expired');
        }
        if (!storedToken.user.isActive) {
            throw new common_1.UnauthorizedException('Account has been deactivated');
        }
        const accessToken = this.generateAccessToken(storedToken.user.id, storedToken.user.email, storedToken.user.role);
        return {
            accessToken,
            expiresIn: this.getAccessTokenExpirySeconds(),
        };
    }
    async logout(dto) {
        const tokenHash = this.hashToken(dto.refreshToken);
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { tokenHash },
            select: { id: true },
        });
        if (storedToken) {
            await this.prisma.refreshToken.update({
                where: { id: storedToken.id },
                data: { revokedAt: new Date() },
            });
        }
        return { message: 'Logged out successfully' };
    }
    async generateTokens(userId, email, role) {
        const accessToken = this.generateAccessToken(userId, email, role);
        const refreshToken = (0, uuid_1.v4)();
        const tokenHash = this.hashToken(refreshToken);
        const refreshExpiresIn = this.configService.get('REFRESH_TOKEN_EXPIRES_IN', '7d');
        const expiresAt = this.calculateExpiry(refreshExpiresIn);
        await this.prisma.refreshToken.create({
            data: {
                userId,
                tokenHash,
                expiresAt,
            },
        });
        return {
            accessToken,
            refreshToken,
            expiresIn: this.getAccessTokenExpirySeconds(),
        };
    }
    generateAccessToken(userId, email, role) {
        const payload = { sub: userId, email, role };
        return this.jwtService.sign(payload);
    }
    hashToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
    }
    getAccessTokenExpirySeconds() {
        const expiresIn = this.configService.get('JWT_EXPIRES_IN', '15m');
        return this.parseExpiryToSeconds(expiresIn);
    }
    parseExpiryToSeconds(expiry) {
        const match = expiry.match(/^(\d+)(s|m|h|d)$/);
        if (!match)
            return 900;
        const value = parseInt(match[1], 10);
        const unit = match[2];
        switch (unit) {
            case 's': return value;
            case 'm': return value * 60;
            case 'h': return value * 3600;
            case 'd': return value * 86400;
            default: return 900;
        }
    }
    calculateExpiry(expiry) {
        const seconds = this.parseExpiryToSeconds(expiry);
        return new Date(Date.now() + seconds * 1000);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map