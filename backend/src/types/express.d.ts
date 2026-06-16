import { Request } from 'express';

export interface AuthPayload {
  ownerId: string;
  organizationId: string;
  role?: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}
