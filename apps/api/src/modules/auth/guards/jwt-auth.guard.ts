import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * NO-AUTH guard: always allows access and injects a mock user.
 * For development/demo only — no login required.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const path: string = request.path || '';

    // Determine role based on the route being accessed
    const isAdminRoute =
      path.includes('/invites') ||
      path.includes('/admin') ||
      path.includes('/applications/stats') ||
      (path.includes('/applications') && request.method === 'GET' && request.params?.id) ||
      (path.includes('/documents') && (path.includes('/verify') || path.includes('/reject'))) ||
      (path.includes('/applications') && path.includes('/review'));

    // Try to find the right user from DB; fall back to a hardcoded mock
    try {
      const role = isAdminRoute ? 'admin' : 'student';
      const user = await this.prisma.user.findFirst({
        where: { role },
        select: { id: true, email: true, role: true, firstName: true, lastName: true },
      });

      if (user) {
        request.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      } else {
        // Fallback mock user
        request.user = {
          id: 'mock-user-id',
          email: isAdminRoute ? 'admin@atria.ac.in' : 'test-student@example.com',
          role: isAdminRoute ? 'admin' : 'student',
          firstName: isAdminRoute ? 'Admin' : 'Test',
          lastName: isAdminRoute ? 'User' : 'Student',
        };
      }
    } catch {
      // If DB is down, use mock
      request.user = {
        id: 'mock-user-id',
        email: 'test-student@example.com',
        role: 'student',
        firstName: 'Test',
        lastName: 'Student',
      };
    }

    return true;
  }
}
