import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

const BCRYPT_COST_FACTOR = 12;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * POST /auth/login — Authenticate user with email + password
   */
  async login(dto: LoginDto) {
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
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
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

  /**
   * POST /auth/set-password — First-time password setup from invite token
   */
  async setPassword(dto: SetPasswordDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Validate invite token
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
      throw new BadRequestException('Invalid invite token');
    }

    if (invite.status !== 'pending') {
      throw new BadRequestException('Invite token has already been used');
    }

    if (new Date() > invite.expiresAt) {
      // Mark invite as expired
      await this.prisma.invite.update({
        where: { id: invite.id },
        data: { status: 'expired' },
      });
      throw new BadRequestException('Invite token has expired. Please contact admin for a new invite.');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: invite.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    // Create user + student profile + mark invite as accepted — all in a transaction
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_COST_FACTOR);

    const result = await this.prisma.$transaction(async (tx) => {
      // Create the user
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

      // Create empty student profile
      await tx.studentProfile.create({
        data: {
          userId: user.id,
        },
      });

      // Mark invite as accepted
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

    // Generate tokens
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

  /**
   * POST /auth/refresh — Exchange refresh token for new access token
   */
  async refreshToken(dto: RefreshTokenDto) {
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
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.revokedAt) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    if (!storedToken.user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    // Generate new access token only
    const accessToken = this.generateAccessToken(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.role,
    );

    return {
      accessToken,
      expiresIn: this.getAccessTokenExpirySeconds(),
    };
  }

  /**
   * POST /auth/logout — Revoke refresh token
   */
  async logout(dto: RefreshTokenDto) {
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

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async generateTokens(userId: string, email: string, role: string) {
    const accessToken = this.generateAccessToken(userId, email, role);
    const refreshToken = uuidv4();
    const tokenHash = this.hashToken(refreshToken);

    // Parse refresh token expiry
    const refreshExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
    const expiresAt = this.calculateExpiry(refreshExpiresIn);

    // Store refresh token hash in DB
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

  private generateAccessToken(userId: string, email: string, role: string): string {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getAccessTokenExpirySeconds(): number {
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    return this.parseExpiryToSeconds(expiresIn);
  }

  private parseExpiryToSeconds(expiry: string): number {
    const match = expiry.match(/^(\d+)(s|m|h|d)$/);
    if (!match) return 900; // default 15 minutes

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

  private calculateExpiry(expiry: string): Date {
    const seconds = this.parseExpiryToSeconds(expiry);
    return new Date(Date.now() + seconds * 1000);
  }
}
