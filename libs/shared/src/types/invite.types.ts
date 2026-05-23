import { InviteStatus } from '../constants/enums';

export interface InviteResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: InviteStatus;
  expiresAt: string;
  createdAt: string;
}

export interface BulkInviteResult {
  total: number;
  sent: number;
  failed: number;
  errors: BulkInviteError[];
}

export interface BulkInviteError {
  row: number;
  email: string;
  reason: string;
}
