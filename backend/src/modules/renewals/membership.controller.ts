import { Response } from 'express';
import { AuthRequest } from '../../types/express';
import * as membershipService from './membership.service';

export const renewMembership = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const result = await membershipService.renewMembership(organizationId, req.body);
    res.status(200).json({ status: 'success', data: result });
  } catch (error: any) {
    if (error.message === 'Member not found') {
      res.status(404).json({ status: 'error', message: error.message });
      return;
    }
    console.error('Renew Membership Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getExpiringMemberships = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const days = parseInt(req.query.days as string) || 7;
    const result = await membershipService.getExpiringMemberships(organizationId, days);
    
    res.status(200).json({ status: 'success', data: result });
  } catch (error: any) {
    console.error('Get Expiring Memberships Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
