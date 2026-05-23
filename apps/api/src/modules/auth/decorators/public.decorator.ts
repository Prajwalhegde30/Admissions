import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a route as public — bypasses JWT auth guard.
 * Use this for login, set-password, invite accept, and health check endpoints.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
