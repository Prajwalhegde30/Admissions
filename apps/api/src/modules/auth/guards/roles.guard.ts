import { Injectable, CanActivate } from '@nestjs/common';

/**
 * NO-AUTH roles guard: always allows access.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(): boolean {
    return true;
  }
}
