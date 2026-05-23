import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    login(dto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.UserRole;
            mustChangePassword: boolean;
        };
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    setPassword(dto: SetPasswordDto): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.UserRole;
            mustChangePassword: boolean;
        };
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    refreshToken(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        expiresIn: number;
    }>;
    logout(dto: RefreshTokenDto): Promise<{
        message: string;
    }>;
    private generateTokens;
    private generateAccessToken;
    private hashToken;
    private getAccessTokenExpirySeconds;
    private parseExpiryToSeconds;
    private calculateExpiry;
}
